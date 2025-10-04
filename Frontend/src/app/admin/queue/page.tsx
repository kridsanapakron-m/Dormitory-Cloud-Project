"use client";

import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  Home,
  Phone,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Search,
  Mail,
  User,
} from "lucide-react";
import { ITEMS_PER_PAGE } from "@/components/data";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

interface QueueItem {
  id: number;
  userId: number;
  roomTypeId: string;
  queueDate: string;
  description: string | null;
  bookingDate: string;
  bookingTime: string;
  firstname: string;
  lastname: string;
  email: string;
  telephone: string;
}

const AdminQueue = () => {
  const [queueList, setQueueList] = useState<QueueItem[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedQueueItem, setSelectedQueueItem] = useState<number>(0);

  // สำหรับ approve queue
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [vacantRooms, setVacantRooms] = useState<{ id: number; roomName: string }[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [selectedQueueForApprove, setSelectedQueueForApprove] = useState<QueueItem | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiFetch("/queue", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data: QueueItem[] = await response.json();
        setQueueList(data);
      } catch (error) {
        console.error("Error fetching queue data:", error);
      }
    };

    fetchData();
  }, []);

  const getFilteredAndSortedRequests = useCallback(() => {
    const filtered = queueList.filter((request) => {
      const matchesSearch =
        `${request.firstname} ${request.lastname}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        request.roomTypeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.email.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });

    const sorted = [...filtered].sort(
      (a, b) => new Date(a.queueDate).getTime() - new Date(b.queueDate).getTime()
    );

    return sorted;
  }, [queueList, searchTerm]);

  const sortedRequests = getFilteredAndSortedRequests();
  const totalPages = Math.ceil(sortedRequests.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const currentItems = sortedRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleDeleteClick = (id: number) => {
    setSelectedQueueItem(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await apiFetch(`/queue/del/${selectedQueueItem}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "ลบไม่สำเร็จ");
      }

      setQueueList((prevList) =>
        prevList.filter((item) => item.id !== selectedQueueItem)
      );

      toast.success("ลบคิวเรียบร้อยแล้ว");
    } catch (error) {
      console.error("Error deleting queue:", error);
      toast.error("เกิดข้อผิดพลาด ไม่สามารถลบได้");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  // ---------------- Approve Queue -----------------
  const handleApproveClick = async (queue: QueueItem) => {
    setSelectedQueueForApprove(queue);
    try {
      const res = await apiFetch(`/queue/availableroom/${queue.roomTypeId}`, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setVacantRooms(data);
        setSelectedRoom(data.length > 0 ? data[0].id : null);
        setIsApproveDialogOpen(true);
      } else {
        toast.error("โหลดห้องว่างไม่สำเร็จ");
      }
    } catch (err) {
      console.error(err);
      toast.error("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    }
  };

  const handleConfirmApprove = async () => {
    if (!selectedQueueForApprove || !selectedRoom) {
      toast.error("กรุณาเลือกห้องที่จะจัดให้");
      return;
    }

    try {
      const res = await apiFetch(`/rooms/${selectedRoom}/assign`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: selectedQueueForApprove.email,
        }),
      });

      console.log(selectedQueueForApprove.email)

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "รับเข้าพักไม่สำเร็จ");
      }

      await apiFetch(`/queue/del/${selectedQueueForApprove.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      setQueueList((prev) =>
        prev.filter((q) => q.id !== selectedQueueForApprove.id)
      );

      toast.success("รับเข้าพักสำเร็จ");
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาดในการรับเข้าพัก");
    } finally {
      setIsApproveDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-auto">
      <div className="flex flex-1">
        <Sidebar />
        <main className="h-screen flex-1 overflow-auto">
          <div className="p-6 pt-16 md:pt-6">
            <div className="container mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">คิวขอเข้าดูห้อง</h1>
                <div className="flex space-x-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="text"
                      placeholder="ค้นหาห้องหรือรายชื่อ..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-full md:w-64"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <p className="text-gray-600">
                  กำลังแสดง {sortedRequests.length} ผลการค้นหา
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-500">
                    หน้า {currentPage} จาก {totalPages}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {currentItems.map((item) => (
                  <Card key={`${item.id}-${item.queueDate}`}>
                    <CardHeader>
                      <CardTitle>
                        {item.firstname} {item.lastname}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Home size={16} className="text-gray-500" />
                        <span className="text-sm">ประเภทห้อง: {item.roomTypeId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarIcon size={16} className="text-gray-500" />
                        <span className="text-sm">
                          วันที่คิว:{" "}
                          {new Date(item.queueDate).toLocaleString("th-TH", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-500" />
                        <span className="text-sm">อีเมล: {item.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-gray-500" />
                        <span className="text-sm">เบอร์โทร: {item.telephone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-500" />
                        <span className="text-sm">เวลา: {item.bookingTime}</span>
                      </div>
                      {item.description && (
                        <div className="md:col-span-2">
                          <h4 className="text-sm font-medium text-gray-500 mb-1">
                            ข้อมูลเพิ่มเติม
                          </h4>
                          <p className="text-sm">{item.description}</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-end gap-3 border-t pt-4">
                      <Button
                        variant="success"
                        onClick={() => handleApproveClick(item)}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        รับเข้าพัก
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteClick(item.id)}
                      >
                        <X className="mr-2 h-4 w-4" />
                        ลบ
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <nav className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      size="sm"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      ก่อนหน้า
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNumber) => (
                        <Button
                          key={`page-${pageNumber}`}
                          variant={
                            currentPage === pageNumber ? "default" : "outline"
                          }
                          onClick={() => goToPage(pageNumber)}
                          size="sm"
                        >
                          {pageNumber}
                        </Button>
                      )
                    )}
                    <Button
                      variant="outline"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      size="sm"
                    >
                      ถัดไป
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <Footer />

      {/* Dialog ลบ */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบคิวนี้? การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog รับเข้าพัก */}
      <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>รับเข้าพัก</AlertDialogTitle>
            <AlertDialogDescription>
              เลือกห้องที่จะจัดให้ {selectedQueueForApprove?.firstname}{" "}
              {selectedQueueForApprove?.lastname}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {vacantRooms.length > 0 ? (
            <select
              value={selectedRoom ?? ""}
              onChange={(e) => setSelectedRoom(Number(e.target.value))}
              className="w-full border rounded-md p-2 my-3"
            >
              {vacantRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.roomName}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-red-500 text-sm my-3">ไม่มีห้องว่าง</p>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmApprove}
              className="bg-green-500 hover:bg-green-600 text-white"
              disabled={!selectedRoom}
            >
              ยืนยัน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminQueue;
