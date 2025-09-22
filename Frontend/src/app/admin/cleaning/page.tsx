"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  CheckCircle,
  CheckIcon,
  Clock,
  Search,
  Trash2,
  Home,
  Filter,
  XCircle,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DollarSign } from "lucide-react";
import { apiFetch } from "@/lib/api";
// Sample cleaning request data

interface Task {
  taskid: number;
  roomid: number | string;
  roomName: string
  taskname: string;
  taskdate: string;
  description: string;
  taskstatus: number;
}

const initialCleaningRequests = [
  {
    id: 1,
    roomNumber: "913",
    service: "Clean Toilet",
    time: new Date(2025, 2, 21, 9, 0), // March 21, 2025, 9:00 AM
    requestedBy: "John Doe",
    status: "pending",
    notes: "Please use non-allergenic cleaning products",
  },
  {
    id: 2,
    roomNumber: "805",
    service: "Vacuum and Mop",
    time: new Date(2025, 2, 21, 11, 30),
    requestedBy: "Jane Smith",
    status: "pending",
    notes: "Need deep cleaning under the bed",
  },
  {
    id: 3,
    roomNumber: "621",
    service: "Change Bedsheets",
    time: new Date(2025, 2, 21, 14, 0),
    requestedBy: "Mark Johnson",
    status: "pending",
    notes: "",
  },
  {
    id: 4,
    roomNumber: "302",
    service: "Full Room Cleaning",
    time: new Date(2025, 2, 22, 10, 0),
    requestedBy: "Lisa Anderson",
    status: "pending",
    notes: "I will be out of the room from 10am to 2pm",
  },
  {
    id: 5,
    roomNumber: "415",
    service: "Clean Bathroom",
    time: new Date(2025, 2, 22, 13, 0),
    requestedBy: "David Williams",
    status: "completed",
    notes: "",
    completedAt: new Date(2025, 2, 22, 13, 45),
  },
  {
    id: 6,
    roomNumber: "710",
    service: "Window Cleaning",
    time: new Date(2025, 2, 23, 9, 30),
    requestedBy: "Sarah Brown",
    status: "pending",
    notes: "Please clean both inside and outside of windows",
  },
  {
    id: 7,
    roomNumber: "222",
    service: "Window Cleaning",
    time: new Date(2025, 2, 23, 9, 30),
    requestedBy: "Sarah Brown",
    status: "pending",
    notes: "Please clean both inside and outside of windows",
  },
  {
    id: 8,
    roomNumber: "123",
    service: "Window Cleaning",
    time: new Date(2025, 2, 23, 9, 30),
    requestedBy: "Sarah Brown",
    status: "pending",
    notes: "Please clean both inside and outside of windows",
  },
  {
    id: 9,
    roomNumber: "245",
    service: "Window Cleaning",
    time: new Date(2025, 2, 23, 9, 30),
    requestedBy: "Sarah Brown",
    status: "pending",
    notes: "Please clean both inside and outside of windows",
  },
  {
    id: 10,
    roomNumber: "2321",
    service: "Window Cleaning",
    time: new Date(2025, 2, 23, 9, 30),
    requestedBy: "Sarah Brown",
    status: "pending",
    notes: "Please clean both inside and outside of windows",
  },
  {
    id: 11,
    roomNumber: "1212",
    service: "Window Cleaning",
    time: new Date(2025, 2, 23, 9, 30),
    requestedBy: "Sarah Brown",
    status: "pending",
    notes: "Please clean both inside and outside of windows",
  },
];

const ITEMS_PER_PAGE = 5;

const CleaningQueuePage = () => {
  const router = useRouter();
  const [cleaningRequests, setCleaningRequests] = useState(
    initialCleaningRequests
  );
  useEffect(() => {
    setCleaningRequests([]);
    apiFetch("/tasks", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => {
        if (res.status == 401) {
          return router.push("/login");
        } else {
          return res.json();
        }
      })
      .then((data: Task[] | {message: string}) => {
        if ("message" in data) return
        const transformedTasks = data.map((task) => ({
          id: task.taskid,
          roomNumber: String(task.roomName),
          service: task.taskname,
          time: new Date(task.taskdate),
          requestedBy: `ห้อง ${task.roomName}`,
          status: task.taskstatus === 0 ? "pending" : "completed",
          notes: task.description,
        }));
        setCleaningRequests(transformedTasks);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Fetch error:", error);
        }
      });
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [price, setPrice] = useState(0.00)
  const getFilteredAndSortedRequests = useCallback(() => {
    const filtered = cleaningRequests.filter((request) => {
      const matchesSearch =
        request.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = showCompleted ? true : request.status === "pending";

      return matchesSearch && matchesStatus;
    });

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      // Pending requests come before completed ones
      if (a.status === "pending" && b.status === "completed") return -1;
      if (a.status === "completed" && b.status === "pending") return 1;

      // Sort by time (ascending)
      return a.time.getTime() - b.time.getTime();
    });

    return sorted;
  }, [cleaningRequests, searchTerm, showCompleted]);

  const sortedRequests = getFilteredAndSortedRequests();
  const totalPages = Math.ceil(sortedRequests.length / ITEMS_PER_PAGE);
  useEffect(()=> {
    if (!isDialogOpen) setPrice(0)
  },[isDialogOpen])
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, showCompleted]);

  // Ensure current page is valid when total pages changes
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
    goToPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    goToPage(currentPage - 1);
  };

  const handleConfirmCleaning = async (id: number) => {
    apiFetch(`/tasks/${id}/setDone`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price
      }),
      credentials: "include",
    })
      .then((value) => {
        if (value.status == 401) return router.push("/login");
      })
      .catch((err) => {
        console.error(err);
      });
    setCleaningRequests(
      cleaningRequests.map((request) =>
        request.id === id
          ? {
              ...request,
              status: "completed",
              completedAt: new Date(),
            }
          : request
      )
    );
    setIsDialogOpen(false);
  };

  const handleOpenRequestDetails = (id: number) => {
    setSelectedRequest(id);
    setIsDialogOpen(true);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Adjust if we're at the end
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-auto">
      <div className="flex flex-1">
        <Sidebar />
        <main className="h-screen flex-1 overflow-auto pb-24">
          <div className="p-6 pt-16 md:pt-6">
            <div className="container mx-auto">
              <div className="flex flex-col md:space-y-4 lg:space-y-0 lg:flex-row md:items-center justify-between mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-0">
                  คิวการขอใช้บริการห้องพัก
                </h1>
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="text"
                      placeholder="ค้นหาห้องหรือบริการ..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-full md:w-64"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="flex items-center gap-2"
                  >
                    {showCompleted ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    {showCompleted ? "ซ่อนรายการที่เสร็จแล้ว" : "แสดงรายการที่เสร็จแล้ว"}
                  </Button>
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <p className="text-gray-600">
                  แสดงทั้งหมด {" "}
                  {
                    sortedRequests.filter((item) => item.status === "pending")
                      .length
                  }{" "}
                  คำขอ
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-500">
                    หน้า {currentPage} จาก {totalPages}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <AnimatePresence>
                  {currentItems.map((request) => (
                    <div key={request.id}>
                      <Card
                        className={`hover:shadow-md transition-all duration-200 cursor-pointer ${
                          request.status === "completed" ? "bg-gray-50" : ""
                        }`}
                        onClick={() => handleOpenRequestDetails(request.id)}
                      >
                        <CardHeader className="pb-2 pt-4">
                          <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                              <Home className="h-5 w-5 text-gray-700" />
                              <CardTitle className="text-lg">
                                ห้อง {request.roomNumber}
                              </CardTitle>
                            </div>
                            <Badge
                              variant="outline"
                              className={`${
                                request.status === "pending"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-green-50 text-green-700 border-green-200"
                              }`}
                            >
                              {request.status === "pending"
                                ? "รอการยืนยัน"
                                : "เสร็จแล้ว"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">บริการ:</span>
                              <span className="font-medium">
                                {request.service}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">
                                {format(request.time, "dd/MM/yyyy")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">
                                {format(request.time, "HH:mm")}
                              </span>
                            </div>
                          </div>
                        </CardContent>

                        {request.status === "pending" && (
                          <CardFooter className="pt-0 pb-3 justify-end">
                            <Button
                              variant="ghost"
                              size="default"
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenRequestDetails(request.id);
                              }}
                            >
                              ดูข้อมูล
                            </Button>
                          </CardFooter>
                        )}
                      </Card>
                    </div>
                  ))}
                </AnimatePresence>

                {sortedRequests.length === 0 && (
                  <div className="bg-white rounded-md p-8 text-center">
                    <p className="text-gray-500">ไม่พบการค้นหา</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  size="sm"
                  className="hidden sm:flex"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="ml-1">ก่อนหน้า</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  size="icon"
                  className="h-8 w-8 sm:hidden"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {getPageNumbers()[0] > 1 && (
                  <>
                    <Button
                      variant={currentPage === 1 ? "default" : "outline"}
                      onClick={() => goToPage(1)}
                      size="sm"
                      className="h-8 w-8"
                    >
                      1
                    </Button>
                    {getPageNumbers()[0] > 2 && (
                      <span className="text-gray-400">...</span>
                    )}
                  </>
                )}

                {/* Page number buttons */}
                {getPageNumbers().map((pageNumber) => (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    onClick={() => goToPage(pageNumber)}
                    size="sm"
                    className="h-8 w-8"
                  >
                    {pageNumber}
                  </Button>
                ))}

                {/* Last page button (if we're not already showing it) */}
                {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                  <>
                    {getPageNumbers()[getPageNumbers().length - 1] <
                      totalPages - 1 && (
                      <span className="text-gray-400">...</span>
                    )}
                    <Button
                      variant={
                        currentPage === totalPages ? "default" : "outline"
                      }
                      onClick={() => goToPage(totalPages)}
                      size="sm"
                      className="h-8 w-8"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}

                <Button
                  variant="outline"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  size="sm"
                  className="hidden sm:flex"
                >
                  <span className="mr-1">หน้าถัดไป</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  size="icon"
                  className="h-8 w-8 sm:hidden"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          )}
        </main>
      </div>

      <Footer />

      {/* Request Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ข้อมูลการขอใช้บริการ</DialogTitle>
            <DialogDescription>
              ข้อมูลการบริการและการยืนยัน
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-2">
              {cleaningRequests.find((r) => r.id === selectedRequest)
                ?.status === "completed" ? (
                <>
                  <div className="rounded-md bg-green-50 p-4 flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium text-green-800">
                        การให้บริการสำเร็จ
                      </p>
                      <p className="text-sm text-green-700">
                        สำเร็ตเมื่อวันที่ {" "}
                        {format(
                          cleaningRequests.find((r) => r.id === selectedRequest)
                            ?.completedAt || new Date(),
                          "dd/MM/yyyy 'เวลา' HH:mm"
                        )}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">หมายเลขห้อง</p>
                      <p className="font-medium">
                        {
                          cleaningRequests.find((r) => r.id === selectedRequest)
                            ?.roomNumber
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">ขอบริการโดย</p>
                      <p className="font-medium">
                        {
                          cleaningRequests.find((r) => r.id === selectedRequest)
                            ?.requestedBy
                        }
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500 mb-1">ประเภทบริการ</p>
                      <p className="font-medium">
                        {
                          cleaningRequests.find((r) => r.id === selectedRequest)
                            ?.service
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">วันที่</p>
                      <p className="font-medium">
                        {format(
                          cleaningRequests.find((r) => r.id === selectedRequest)
                            ?.time || new Date(),
                          "dd/MM/yyyy"
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">เวลา</p>
                      <p className="font-medium">
                        {format(
                          cleaningRequests.find((r) => r.id === selectedRequest)
                            ?.time || new Date(),
                          "HH:mm"
                        )}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500 mb-1">
                        ข้อมูลเพิ่มเติม
                      </p>
                      <p className="font-medium">
                        {cleaningRequests.find((r) => r.id === selectedRequest)
                          ?.notes || "No additional notes"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p>ราคา</p>
                    <div className="relative">
                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                      type="number"
                      placeholder="Enter Price"
                      value={price}
                      min={0}
                      onChange={(e) => setPrice(e.target.value === "" ? 0 : Math.abs(Number.parseFloat(e.target.value)))}
                      className="pl-9 w-full md:w-64"
                      step={0.01}
                    />
                    </div>
                    
                  </div>
                  <DialogFooter className="pt-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="w-full sm:w-auto"
                    >
                      ยกเลิก
                    </Button>
                    <Button
                      className="w-full sm:w-auto"
                      onClick={() => handleConfirmCleaning(selectedRequest)}
                    >
                      <CheckIcon className="mr-2 h-4 w-4" />
                      ยืนยันการใช้บริการสำเร็จ
                    </Button>
                  </DialogFooter>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CleaningQueuePage;
