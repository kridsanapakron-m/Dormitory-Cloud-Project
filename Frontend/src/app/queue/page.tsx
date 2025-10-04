"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  CalendarRange,
  CalendarIcon,
  Clock,
  Mail,
  Contact,
  FolderPen,
  Phone
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

// Room type definition
type RoomType = {
  id: number;
  roomType: string;
  details: string;
  name: string
  imageSrc: string;
  roomprice: number;
};

// Sample available times
const availableTimes = [
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
];

const QueueAppointment = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(
    null
  );
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] =
    useState<boolean>(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState<boolean>(false);
  const [appointmentDetails, setAppointmentDetails] = useState({
    email: "",
    firstname: "",
    lastname: "",
    telephone: "",
    preferredDate: "",
    preferredTime: availableTimes[0],
    specialRequests: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isButtonDisabled, setIsButtonDisabled] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    apiFetch("/roomtype", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        const transformed = data.map((rt: any) => ({
          id: rt.id,
          roomType: rt.roomtypeid,
          name: rt.name,
          details: rt.description,
          imageSrc: rt.roomtypeimg || "/room/no-image.png",
          roomprice: rt.roomprice,
        }));
        setRoomTypes(transformed);
      })
      .catch((err) => {
        console.error("Failed to load room types:", err);
        toast.error("ไม่สามารถโหลดข้อมูลห้องพักได้");
      });
  }, []);

  const filteredRoomTypes = roomTypes.filter(
    (room) =>
      room.roomType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBookAppointment = (roomType: RoomType) => {
    setSelectedRoomType(roomType);
    setIsAppointmentDialogOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!appointmentDetails.email) {
      errors.email = "กรุณากรอกอีเมล";
    } else if (!/\S+@\S+\.\S+/.test(appointmentDetails.email)) {
      errors.email = "อีเมลไม่ถูกต้อง";
    }
    if (!appointmentDetails.preferredDate) {
      errors.preferredDate = "กรุณาเลือกวันที่นัดหมาย";
    }
    if (!appointmentDetails.firstname) {
      errors.firstname = "กรุณากรอกชื่อ";
    }
    if (!appointmentDetails.lastname) {
      errors.lastname = "กรุณากรอกนามสกุล";
    }

    if (!appointmentDetails.telephone) {
      errors.telephone = "กรุณากรอกเบอร์โทรศัพท์";
    } else if (!/^[0-9]{9,10}$/.test(appointmentDetails.telephone)) {
      errors.telephone = "เบอร์โทรไม่ถูกต้อง";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitAppointment = () => {
    if (validateForm()) {
      setIsAppointmentDialogOpen(false);
      setIsConfirmationDialogOpen(true);
    }
  };

  const handleConfirmAppointment = async () => {
    if (!selectedRoomType) return;
    try {
      const response = await apiFetch(`/queue/${selectedRoomType.roomType}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: appointmentDetails.email,
          firstname: appointmentDetails.firstname,
          lastname: appointmentDetails.lastname,
          telephone: appointmentDetails.telephone,
          bookingDate: appointmentDetails.preferredDate.toString(),
          bookingTime: appointmentDetails.preferredTime,
          description: appointmentDetails.specialRequests,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        toast.success(data.message, {
          description: `คุณได้จองคิวดูห้องพักประเภท ${selectedRoomType?.roomType} เรียบร้อยแล้ว`,
          duration: 5000,
        });
      } else {
        const errorData = await response.json();
        if (response.status === 409) {
          toast.error("คิวเต็ม", {
            description:
              "คิวสำหรับห้องประเภทนี้เต็มแล้ว กรุณาเลือกห้องประเภทอื่นหรือลองใหม่ภายหลัง",
            duration: 5000,
          });
        } else if (response.status === 401) {
          toast.error("กรุณาเข้าสู่ระบบ", {
            description: errorData.message,
            duration: 5000,
          });
        } else {
          toast.error("เกิดข้อผิดพลาด", {
            description:
              errorData.message || "มีข้อผิดพลาดในการจองคิว กรุณาลองอีกครั้ง",
            duration: 5000,
          });
        }
        console.error("Failed to book appointment:", response.status, errorData);
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error("เกิดข้อผิดพลาด", {
        description: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองอีกครั้ง",
        duration: 5000,
      });
    } finally {
      setIsConfirmationDialogOpen(false);
      setAppointmentDetails({
        email: "",
        firstname: "",
        lastname: "",
        preferredDate: "",
        preferredTime: availableTimes[0],
        specialRequests: "",
        telephone: ""
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setAppointmentDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-auto">
      <div className="flex flex-1">
        <main className="h-screen flex-1 overflow-auto">
          <div className="p-6 pt-16 md:pt-6">
            <div className="container mx-auto">
              {/* search bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-0">
                  จองคิวเข้าดูห้องพัก
                </h1>
                <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="text"
                      placeholder="ค้นหาประเภทห้องพัก..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Room Types Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRoomTypes.map((roomType) => (
                  <Card
                    key={roomType.id}
                    className="overflow-hidden hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="relative w-full h-48">
                      <Image
                        src={roomType.imageSrc}
                        alt={`Room Type ${roomType.roomType}`}
                        className="object-cover"
                        fill
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-xl">
                          {roomType.roomType} {roomType.name}
                        </CardTitle>
                      </div>
                      <CardDescription className="line-clamp-2 mt-1">
                        {roomType.details}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-green-600">
                          ฿{roomType.roomprice.toLocaleString()}/เดือน
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button
                        variant="default"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={() => handleBookAppointment(roomType)}
                        disabled={isButtonDisabled[roomType.id]}
                      >
                        <CalendarRange className="h-4 w-4" />
                        จองคิวเข้าดู
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {filteredRoomTypes.length === 0 && (
                <div className="bg-white rounded-lg shadow p-8 text-center mt-6">
                  <p className="text-gray-500">ไม่พบข้อมูลประเภทห้องพัก</p>
                </div>
              )}
            </div>
          </div>
          <Footer />
        </main>
      </div>

      {/* Dialog สำหรับกรอกข้อมูลการจองคิว */}
      <Dialog
        open={isAppointmentDialogOpen}
        onOpenChange={setIsAppointmentDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>จองคิวเข้าชมห้องพัก</DialogTitle>
            <DialogDescription>
              กรอกข้อมูลเพื่อจองคิวเข้าชมห้องพักประเภท{" "}
              {selectedRoomType?.roomType}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-3">
              {/* Email */}
              <div>
                <Label htmlFor="email">อีเมล <span className="text-red-500">*</span></Label>
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-gray-500" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="example@email.com"
                    value={appointmentDetails.email}
                    onChange={handleInputChange}
                    className={formErrors.email ? "border-red-500" : ""}
                  />
                </div>
                {formErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                )}
              </div>

              {/* Telephone */}
              <div>
                <Label htmlFor="telephone">
                  เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4 text-gray-500" />
                  <Input
                    id="telephone"
                    name="telephone"
                    type="text"
                    placeholder="กรอกเบอร์โทรศัพท์"
                    value={appointmentDetails.telephone}
                    onChange={handleInputChange}
                    className={formErrors.telephone ? "border-red-500" : ""}
                  />
                </div>
                {formErrors.telephone && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.telephone}
                  </p>
                )}
              </div>
              {/* Firstname */}
              <div>
                <Label htmlFor="firstname">ชื่อ <span className="text-red-500">*</span></Label>
                <div className="flex items-center">
                  <Contact className="mr-2 h-4 w-4 text-gray-500" />
                  <Input
                    id="firstname"
                    name="firstname"
                    type="text"
                    placeholder="กรอกชื่อ"
                    value={appointmentDetails.firstname}
                    onChange={handleInputChange}
                    className={formErrors.firstname ? "border-red-500" : ""}
                  />
                </div>
                {formErrors.firstname && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.firstname}</p>
                )}
              </div>

              {/* Lastname */}
              <div>
                <Label htmlFor="lastname">นามสกุล <span className="text-red-500">*</span></Label>
                <div className="flex items-center">
                  <FolderPen className="mr-2 h-4 w-4 text-gray-500" />
                  <Input
                    id="lastname"
                    name="lastname"
                    type="text"
                    placeholder="กรอกนามสกุล"
                    value={appointmentDetails.lastname}
                    onChange={handleInputChange}
                    className={formErrors.lastname ? "border-red-500" : ""}
                  />
                </div>
                {formErrors.lastname && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.lastname}</p>
                )}
              </div>

              {/* Date */}
              <div>
                <Label htmlFor="preferredDate">วันที่ต้องการเข้าชม <span className="text-red-500">*</span></Label>
                <div className="flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                  <Input
                    id="preferredDate"
                    name="preferredDate"
                    type="date"
                    min={today}
                    value={appointmentDetails.preferredDate}
                    onChange={handleInputChange}
                    className={formErrors.preferredDate ? "border-red-500" : ""}
                  />
                </div>
                {formErrors.preferredDate && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.preferredDate}</p>
                )}
              </div>

              {/* Time */}
              <div>
                <Label htmlFor="preferredTime">เวลาที่ต้องการเข้าชม <span className="text-red-500">*</span></Label>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-gray-500" />
                  <select
                    id="preferredTime"
                    name="preferredTime"
                    value={appointmentDetails.preferredTime}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input px-3 py-2"
                  >
                    {availableTimes.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <Label htmlFor="specialRequests">ความต้องการพิเศษ (ถ้ามี)</Label>
                <Textarea
                  id="specialRequests"
                  name="specialRequests"
                  placeholder="โปรดระบุความต้องการพิเศษ"
                  value={appointmentDetails.specialRequests}
                  onChange={handleInputChange}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">ยกเลิก</Button>
            </DialogClose>
            <Button onClick={handleSubmitAppointment}>ยืนยันการจอง</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirm */}
      <Dialog
        open={isConfirmationDialogOpen}
        onOpenChange={setIsConfirmationDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ยืนยันการจองคิว</DialogTitle>
            <DialogDescription>โปรดยืนยันข้อมูลก่อนส่งการจอง</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p><strong>อีเมล:</strong> {appointmentDetails.email}</p>
            <p><strong>เบอร์โทร:</strong> {appointmentDetails.telephone}</p>
            <p><strong>ชื่อ-นามสกุล:</strong> {appointmentDetails.firstname} {appointmentDetails.lastname}</p>
            <p><strong>วันที่เข้าชม:</strong> {appointmentDetails.preferredDate}</p>
            <p><strong>เวลา:</strong> {appointmentDetails.preferredTime}</p>
            {appointmentDetails.specialRequests && (
              <p><strong>ความต้องการพิเศษ:</strong> {appointmentDetails.specialRequests}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmationDialogOpen(false)}>
              แก้ไข
            </Button>
            <Button onClick={handleConfirmAppointment}>ยืนยันการจองคิว</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QueueAppointment;
