"use client";

import React, { useState } from "react";
import SidebarUser from "@/components/SidebarUser";
import Footer from "@/components/Footer";
import {
  Clock,
  Wrench,
  PhoneCall,
  ClipboardCheck,
  Shield,
  Lightbulb,
  Snowflake,
  WashingMachine,
  ChevronRight,
  Check,
  Package,
  X,
  Shirt, Bath, Bug, Wifi, Fan, Plug, Bed, Table, DoorOpen, Refrigerator, ShowerHead, Toilet,Brush
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


type Service = {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: "housekeeping" | "maintenance";
  estimatedTime: string;
  priceRange?: string;
};


const timeSlots = [
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];

const ServicePage = () => {
  const services: Service[] = [
    { id: 1, title: "ทำความสะอาดห้อง", description: "บริการทำความสะอาดห้องพักสำหรับนักศึกษา", icon: <Brush size={20} />, category: "housekeeping", estimatedTime: "1-2 ชั่วโมง", priceRange: "150 - 300 บาท" },
    { id: 2, title: "ซักผ้าน้ำหนัก 7 กิโลกรัม", description: "บริการซักผ้าสำหรับนักศึกษา", icon: <Shirt size={20} />, category: "housekeeping", estimatedTime: "30-60 นาที", priceRange: "30 - 50 บาท" },
    { id: 3, title: "ซักผ้าน้ำหนัก 9 กิโลกรัม", description: "บริการซักผ้าน้ำหนักมากขึ้น", icon: <Shirt size={20} />, category: "housekeeping", estimatedTime: "45-75 นาที", priceRange: "40 - 60 บาท" },
    { id: 4, title: "ซักผ้าน้ำหนัก 12 กิโลกรัม", description: "ซักผ้าแบบเหมาะสำหรับชุดหนัก", icon: <Shirt size={20} />, category: "housekeeping", estimatedTime: "60-90 นาที", priceRange: "50 - 70 บาท" },
    { id: 5, title: "ซักผ้าน้ำหนัก 15 กิโลกรัม", description: "ซักผ้าสำหรับของใช้ขนาดใหญ่", icon: <Shirt size={20} />, category: "housekeeping", estimatedTime: "75-105 นาที", priceRange: "60 - 80 บาท" },
    { id: 6, title: "อบผ้าน้ำหนัก 7 กิโลกรัม", description: "อบผ้าแห้งด้วยเครื่องอบคุณภาพสูง", icon: <Shirt size={20} />, category: "housekeeping", estimatedTime: "30-60 นาที", priceRange: "30 - 50 บาท" },
    { id: 7, title: "อบผ้าน้ำหนัก 9 กิโลกรัม", description: "อบผ้าด้วยอุณหภูมิที่เหมาะสม", icon: <Shirt size={20} />, category: "housekeeping", estimatedTime: "45-75 นาที", priceRange: "40 - 60 บาท" },
    { id: 8, title: "อบผ้าน้ำหนัก 12 กิโลกรัม", description: "อบผ้าขนาดใหญ่ให้แห้งสนิท", icon: <Shirt size={20} />, category: "housekeeping", estimatedTime: "60-90 นาที", priceRange: "50 - 70 บาท" },
    { id: 9, title: "อบผ้าน้ำหนัก 15 กิโลกรัม", description: "อบผ้าให้เหมาะกับชุดขนาดใหญ่", icon: <Shirt size={20} />, category: "housekeeping", estimatedTime: "75-105 นาที", priceRange: "60 - 80 บาท" },
    { id: 10, title: "ทำความสะอาดห้องน้ำ", description: "บริการขัดและล้างห้องน้ำ", icon: <Bath size={20} />, category: "housekeeping", estimatedTime: "1-2 ชั่วโมง", priceRange: "150 - 300 บาท" },
    { id: 11, title: "ทำความสะอาดตู้เย็น", description: "ล้างทำความสะอาดภายในและภายนอกตู้เย็น", icon: <Refrigerator size={20} />, category: "housekeeping", estimatedTime: "1-2 ชั่วโมง", priceRange: "100 - 250 บาท" },
    { id: 12, title: "กำจัดแมลง", description: "บริการกำจัดแมลงรบกวน", icon: <Bug size={20} />, category: "housekeeping", estimatedTime: "2-3 ชั่วโมง", priceRange: "300 - 600 บาท" },
    { id: 13, title: "รีดผ้า", description: "บริการรีดผ้าให้เรียบตามต้องการ", icon: <Shirt size={20} />, category: "housekeeping", estimatedTime: "30-60 นาที", priceRange: "50 - 100 บาท" },
    { id: 14, title: "ติดอินเตอร์เน็ต", description: "บริการติดตั้งอินเตอร์เน็ตใหม่", icon: <Wifi size={20} />, category: "maintenance", estimatedTime: "1-2 ชั่วโมง", priceRange: "500 - 1,000 บาท" },
    { id: 15, title: "ซ่อมไฟในห้อง", description: "แก้ไขปัญหาไฟฟ้าในห้องพัก", icon: <Lightbulb size={20} />, category: "maintenance", estimatedTime: "1-2 ชั่วโมง", priceRange: "200 - 400 บาท" },
    { id: 16, title: "ซ่อมเครื่องปรับอากาศ", description: "ตรวจเช็คและซ่อมแอร์", icon: <Fan size={20} />, category: "maintenance", estimatedTime: "2-3 ชั่วโมง", priceRange: "500 - 1,000 บาท" },
    { id: 17, title: "ซ่อมปลั๊กไฟ", description: "ซ่อมแซมปลั๊กไฟชำรุด", icon: <Plug size={20} />, category: "maintenance", estimatedTime: "30-60 นาที", priceRange: "150 - 350 บาท" },
    { id: 18, title: "ซ่อมเตียงนอน", description: "แก้ไขเตียงหักหรือเสียงดัง", icon: <Bed size={20} />, category: "maintenance", estimatedTime: "1-2 ชั่วโมง", priceRange: "300 - 600 บาท" },
    { id: 19, title: "ซ่อมโต๊ะทำงาน", description: "ซ่อมแซมขาโต๊ะและพื้นโต๊ะ", icon: <Table size={20} />, category: "maintenance", estimatedTime: "1-2 ชั่วโมง", priceRange: "200 - 500 บาท" },
    { id: 20, title: "ซ่อมประตู", description: "ปรับแต่งและแก้ไขประตูเสียหาย", icon: <DoorOpen size={20} />, category: "maintenance", estimatedTime: "1-2 ชั่วโมง", priceRange: "250 - 500 บาท" },
    { id: 21, title: "ซ่อมตู้เสื้อผ้า", description: "แก้ไขบานพับและรางลิ้นชัก", icon: <Package size={20} />, category: "maintenance", estimatedTime: "1-2 ชั่วโมง", priceRange: "200 - 500 บาท" },
    { id: 22, title: "ซ่อมอินเตอร์เน็ต", description: "แก้ไขปัญหาสัญญาณอินเตอร์เน็ต", icon: <Wifi size={20} />, category: "maintenance", estimatedTime: "30-90 นาที", priceRange: "100 - 300 บาท" },
    { id: 23, title: "ซ่อมฝักบัว", description: "เปลี่ยนหรือซ่อมฝักบัวอาบน้ำ", icon: <ShowerHead size={20} />, category: "maintenance", estimatedTime: "1-2 ชั่วโมง", priceRange: "200 - 500 บาท" },
    { id: 24, title: "ซ่อมชักโครก", description: "แก้ไขปัญหาการรั่วหรือกดไม่ลง", icon: <Toilet size={20} />, category: "maintenance", estimatedTime: "1-2 ชั่วโมง", priceRange: "300 - 700 บาท" },
    { id: 25, title: "ซ่อมอ่างล้างหน้า", description: "ซ่อมรอยรั่วหรือเปลี่ยนอ่างใหม่", icon: <Bath size={20} />, category: "maintenance", estimatedTime: "1-2 ชั่วโมง", priceRange: "250 - 600 บาท" },
    { id: 26, title: "ซ่อมตู้เย็น", description: "แก้ไขปัญหาตู้เย็นไม่เย็นหรือรั่ว", icon: <Refrigerator size={20} />, category: "maintenance", estimatedTime: "2-3 ชั่วโมง", priceRange: "400 - 800 บาท" },
    { id: 27, title: "ซ่อมก๊อกน้ำ", description: "แก้ไขปัญหาก๊อกน้ำไม่ไหลหรือรั่ว", icon: <Refrigerator size={20} />, category: "maintenance", estimatedTime: "2-3 ชั่วโมง", priceRange: "400 - 800 บาท" }
  ];;

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState<boolean>(false);
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);

  // Handle service selection
  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setIsDialogOpen(true);
    setSelectedDate("");
    setSelectedTime("");
    setNote("");
    setBookingConfirmed(false);
  };

  // Handle booking submission
  const handleBookingSubmit = () => {
    setIsDialogOpen(false);
    setIsConfirmationOpen(true);
  };

  // Handle booking confirmation
  const handleConfirmBooking = () => {
    const reservedatetime = `${selectedDate} ${selectedTime}`
    fetch("http://localhost:3000/tasks?byuserid=1", {
      method:"POST",
      credentials:"include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        taskname: selectedService?.title,
        tasktype: selectedService?.category,
        taskdate: reservedatetime,
        description: note,
        taskprice: 10,
        priceset: false,
      }),

    }).catch((ex)=> {
      console.error(ex)
    });
    setIsConfirmationOpen(false);
    setBookingConfirmed(true);
    // Here you would typically make an API call to save the booking
  };

  // Generate a list of dates for the next 7 days
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split("T")[0];
      const readableDate = date.toLocaleDateString("th-TH", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      dates.push({ value: dateString, label: readableDate });
    }

    return dates;
  };

  const availableDates = generateAvailableDates();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex flex-1">
        <SidebarUser />

        <main className="flex-1 p-6 pt-16 md:pt-6 overflow-auto">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0 flex items-center">
                <ClipboardCheck className="w-6 h-6 mr-2 text-primary" />
                บริการหอพัก
              </h1>
            </div>

            {/* Service Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Housekeeping Services */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl flex items-center">
                    <PhoneCall className="w-5 h-5 mr-2 text-blue-500" />
                    บริการแม่บ้าน
                  </CardTitle>
                  <CardDescription>
                    บริการทำความสะอาดและดูแลห้องพัก
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {services
                    .filter((service) => service.category === "housekeeping")
                    .map((service) => (
                      <Button
                        key={service.id}
                        variant="outline"
                        className="h-auto p-4 justify-start flex flex-col items-start text-left hover:bg-blue-50 transition-colors border-blue-100"
                        onClick={() => handleServiceSelect(service)}
                      >
                        <div className="flex items-center w-full mb-2">
                          <div className="bg-blue-100 p-2 rounded-md mr-3">
                            {service.icon}
                          </div>
                          <span className="font-medium flex-1">
                            {service.title}
                          </span>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500 mb-1">
                          {service.description}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>
                            ระยะเวลาโดยประมาณ: {service.estimatedTime}
                          </span>
                          {service.priceRange && (
                            <>
                              <span className="mx-2">•</span>
                              <span>ราคา: {service.priceRange}</span>
                            </>
                          )}
                        </div>
                      </Button>
                    ))}
                </CardContent>
              </Card>

              {/* Maintenance Services */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl flex items-center">
                    <Wrench className="w-5 h-5 mr-2 text-orange-500" />
                    บริการซ่อมบำรุง
                  </CardTitle>
                  <CardDescription>
                    บริการซ่อมแซมและแก้ไขปัญหาในห้องพัก
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {services
                    .filter((service) => service.category === "maintenance")
                    .map((service) => (
                      <Button
                        key={service.id}
                        variant="outline"
                        className="h-auto p-4 justify-start flex flex-col items-start text-left hover:bg-orange-50 transition-colors border-orange-100"
                        onClick={() => handleServiceSelect(service)}
                      >
                        <div className="flex items-center w-full mb-2">
                          <div className="bg-orange-100 p-2 rounded-md mr-3">
                            {service.icon}
                          </div>
                          <span className="font-medium flex-1">
                            {service.title}
                          </span>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500 mb-1">
                          {service.description}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>
                            ระยะเวลาโดยประมาณ: {service.estimatedTime}
                          </span>
                          {service.priceRange && (
                            <>
                              <span className="mx-2">•</span>
                              <span>ราคา: {service.priceRange}</span>
                            </>
                          )}
                        </div>
                      </Button>
                    ))}
                </CardContent>
              </Card>
            </div>

            {bookingConfirmed && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
                <div className="bg-green-100 p-2 rounded-full mr-3 flex-shrink-0">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-green-800">การจองสำเร็จ!</h3>
                  <p className="text-green-700">
                    คุณได้จองบริการ "{selectedService?.title}" สำหรับวันที่{" "}
                    {selectedDate &&
                      new Date(selectedDate).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}{" "}
                    เวลา {selectedTime} น.
                    โดยจะมีเจ้าหน้าที่มาให้บริการตามเวลาที่นัดหมาย
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>จองบริการ: {selectedService?.title}</DialogTitle>
            <DialogDescription>
              เลือกวันและเวลาที่ต้องการรับบริการ
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="booking-date" className="text-right">
                วันที่
              </Label>
              <select
                id="booking-date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>
                  เลือกวันที่
                </option>
                {availableDates.map((date) => (
                  <option key={date.value} value={date.value}>
                    {date.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="booking-time" className="text-right">
                เวลา
              </Label>
              <select
                id="booking-time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!selectedDate}
              >
                <option value="" disabled>
                  เลือกเวลา
                </option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time} น.
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="booking-note" className="text-right pt-2">
                หมายเหตุ
              </Label>
              <textarea
                id="booking-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="รายละเอียดเพิ่มเติม เช่น จุดที่ต้องการให้เน้นเป็นพิเศษ หรือข้อมูลที่ต้องการแจ้ง"
                className="col-span-3 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              onClick={handleBookingSubmit}
              disabled={!selectedDate || !selectedTime}
              className="bg-primary hover:bg-primary/90"
            >
              ยืนยันการจอง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isConfirmationOpen}
        onOpenChange={setIsConfirmationOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการจองบริการ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการจองบริการ "{selectedService?.title}" ในวันที่{" "}
              {selectedDate &&
                new Date(selectedDate).toLocaleDateString("th-TH", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
              เวลา {selectedTime} น. ใช่หรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBooking}>
              ยืนยัน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ServicePage;
