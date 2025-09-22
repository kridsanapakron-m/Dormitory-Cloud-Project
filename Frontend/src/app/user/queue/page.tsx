"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  CalendarRange,
  AlertTriangle,
  CalendarIcon,
  Clock,
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
  imageSrc: string;
  price: number;
};

// Appointment type definition
type AppointmentType = {
  id: number;
  roomTypeId: number;
  preferredDate: Date;
  preferredTime: string;
  specialRequests: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: Date;
};

// Sample room types data
const sampleRoomTypes: RoomType[] = [
  {
    id: 1,
    roomType: "A",
    details: "ห้องพัดลมสำหรับ 2 คน พร้อมห้องน้ำในตัว สำหรับนักศึกษา",
    imageSrc: "/room/typea.png",
    price: 8400,
  },
  {
    id: 2,
    roomType: "B",
    details: "ห้องปรับอากาศสำหรับ 2 คน พร้อมห้องน้ำในตัว",
    imageSrc: "/room/typeb.png",
    price: 12000,
  },
  {
    id: 3,
    roomType: "C",
    details: "ห้องปรับอากาศสำหรับ 1 คน พร้อมห้องน้ำในตัว",
    imageSrc: "/room/typec.png",
    price: 13400,
  },
];

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
  const [roomTypes, setRoomTypes] = useState<RoomType[]>(sampleRoomTypes);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(
    null
  );
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] =
    useState<boolean>(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState<boolean>(false);
  const [appointmentDetails, setAppointmentDetails] = useState({
    preferredDate: "",
    preferredTime: availableTimes[0],
    specialRequests: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isButtonDisabled, setIsButtonDisabled] = useState<
    Record<number, boolean>
  >({});

  const filteredRoomTypes = roomTypes.filter(
    (room) =>
      room.roomType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.details.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleLogout = async () => {
    try {
      const response = await apiFetch("/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        toast.success("ออกจากระบบสำเร็จ");
        router.push("/"); // Redirect to home or login page
      } else {
        // Handle errors, e.g., show a notification
        const errorData = await response.json();
        console.error("Logout failed:", errorData);
        toast.error(`ออกจากระบบไม่สำเร็จเนื่องจาก: ${errorData.message || "ไม่ทราบสาเหตุ"}`);
      }
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("ออกจากระบบไม่สำเร็จเนื่องจาก:  ข้อผิดพลาดทางเครือข่าย");
    }
  };
  const checkQueueStatus = async (roomType: string, id: number) => {
    try {
      const response = await apiFetch(
        `/queue/check/${roomType}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      setIsButtonDisabled((prev) => ({
        ...prev,
        [id]: response.status === 409,
      }));
    } catch (error) {
      console.error("Error checking queue status:", error);
      setIsButtonDisabled((prev) => ({
        ...prev,
        [id]: false,
      }));
    }
  };

  useEffect(() => {
    filteredRoomTypes.forEach((room) => {
      checkQueueStatus(room.roomType, room.id);
    });
  }, [roomTypes]);

  const handleBookAppointment = (roomType: RoomType) => {
    setSelectedRoomType(roomType);
    setIsAppointmentDialogOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!appointmentDetails.preferredDate) {
      errors.preferredDate = "กรุณาเลือกวันที่นัดหมาย";
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
      const response = await apiFetch(
        `/queue/${selectedRoomType.roomType}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            bookingDate: appointmentDetails.preferredDate.toString(),
            bookingTime: appointmentDetails.preferredTime,
            description: appointmentDetails.specialRequests,
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        toast.success(data.message, {
          description: `คุณได้จองคิวดูห้องพักประเภท ${selectedRoomType?.roomType} เรียบร้อยแล้ว`,
          duration: 5000,
        });
        checkQueueStatus(selectedRoomType.roomType, selectedRoomType.id);
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
        console.error(
          "Failed to book appointment:",
          response.status,
          errorData
        );
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
        preferredDate: "",
        preferredTime: availableTimes[0],
        specialRequests: "",
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

    // Clear error for this field when user types
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
                          Type {roomType.roomType}
                        </CardTitle>
                      </div>
                      <CardDescription className="line-clamp-2 mt-1">
                        {roomType.details}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-green-600">
                          ฿{roomType.price.toLocaleString()}/เดือน
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button
                        variant="default"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={() => handleBookAppointment(roomType)}
                        disabled={isButtonDisabled[roomType.id]} // Use the disabled state
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

              <div className="flex justify-end mt-12">
                <Button
                  variant="destructive"
                  className="hover:scale-105 transition-all duration-300"
                  onClick={handleLogout}
                >
                  ออกจากระบบ
                </Button>
              </div>
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
              <div>
                <Label htmlFor="preferredDate" className="text-right">
                  วันที่ต้องการเข้าชม <span className="text-red-500">*</span>
                </Label>
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
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.preferredDate}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="preferredTime" className="text-right">
                  เวลาที่ต้องการเข้าชม <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-gray-500" />
                  <select
                    id="preferredTime"
                    name="preferredTime"
                    value={appointmentDetails.preferredTime}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {availableTimes.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="specialRequests" className="text-right">
                  ความต้องการพิเศษ (ถ้ามี)
                </Label>
                <Textarea
                  id="specialRequests"
                  name="specialRequests"
                  placeholder="โปรดระบุความต้องการพิเศษในการเข้าชม เช่น ต้องการให้มีผู้ดูแลนำเที่ยวชม"
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

      {/* Dialog สำหรับแสดงการยืนยันการจอง */}
      <Dialog
        open={isConfirmationDialogOpen}
        onOpenChange={setIsConfirmationDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ยืนยันการจองคิว</DialogTitle>
            <DialogDescription>
              โปรดตรวจสอบข้อมูลการจองของคุณให้ถูกต้อง
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Card className="border-0 shadow-none">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="text-lg">ข้อมูลห้องพัก</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">ประเภทห้อง:</span>
                  <span className="font-medium">
                    {selectedRoomType?.roomType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">รายละเอียด:</span>
                  <span className="font-medium text-right max-w-[60%]">
                    {selectedRoomType?.details}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ค่าเช่ารายเดือน:</span>
                  <span className="font-medium">
                    ฿{selectedRoomType?.price.toLocaleString()}/เดือน
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="text-lg">ข้อมูลการนัดหมาย</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">วันที่เข้าชม:</span>
                  <span className="font-medium">
                    {appointmentDetails.preferredDate
                      ? new Date(
                          appointmentDetails.preferredDate
                        ).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">เวลาเข้าชม:</span>
                  <span className="font-medium">
                    {appointmentDetails.preferredTime}
                  </span>
                </div>
                {appointmentDetails.specialRequests && (
                  <div className="pt-2">
                    <span className="text-gray-500 block">
                      ความต้องการพิเศษ:
                    </span>
                    <p className="text-sm mt-1 p-2 bg-gray-50 rounded-md">
                      {appointmentDetails.specialRequests}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="bg-yellow-50 p-3 rounded-md flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-700">
                การยืนยันนี้เป็นเพียงการจองคิวเข้าชมห้องพักเท่านั้น
                ไม่ใช่การจองห้องพัก
                คุณจะได้รับการติดต่อกลับเพื่อยืนยันเวลานัดหมายอีกครั้ง
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmationDialogOpen(false)}
            >
              แก้ไขข้อมูล
            </Button>
            <Button onClick={handleConfirmAppointment}>ยืนยันการจองคิว</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QueueAppointment;
