"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search,
  Home,
  Plus,
  Check,
  Calendar,
  Zap,
  Droplets,
  PlusCircle,
  X,
  Scissors,
  Wrench,
  ShowerHead,
  Printer,
  CheckCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import Image from "next/image";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

interface AdditionalFee {
  type: "housewife" | "fixing" | "laundry" | "internet" | "other";
  amount: number;
  description: string;
}

interface UtilityRecord {
  id: number;
  roomNumber: string;
  month: string;
  electric: number;
  water: number;
  roomFee: number;
  additionalFees: AdditionalFee[];
  status: "paid" | "unpaid";
  dueDate: Date;
  paidDate?: Date;
  imageFile?: string;
}

interface NewUtility {
  id: number;
  roomNumber: string;
  roomFee: number;
  month: string;
  electric: number;
  water: number;
  additionalFees: AdditionalFee[];
  status: "paid" | "unpaid";
  dueDate: Date;
}
interface Room {
  id: number;
  roomNumber: string;
  floor: number;
  type: string;
  status: string;
  tenantId: string;
  monthlyRent: number;
}

const UtilityPage = () => {
  const initialUtilityData: UtilityRecord[] = [];
  const [rooms, setRoom] = useState<Room[]>();
  const [feenotfromfetch, setFeenotfromfetch] = useState([] as AdditionalFee[]);
  const [utilityData, setUtilityData] = useState<UtilityRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUtility, setNewUtility] = useState<NewUtility>({
    id: 0,
    roomNumber: "",
    roomFee: 0,
    month: format(new Date(), "MMM yyyy"),
    electric: 0,
    water: 0,
    additionalFees: [],
    status: "unpaid",
    dueDate: new Date(new Date().setDate(15)),
  });

  const [showAddFee, setShowAddFee] = useState(false);
  const [newFee, setNewFee] = useState<AdditionalFee>({
    type: "housewife",
    amount: 0,
    description: "",
  });
  const [isLoading, setLoading] = useState(true)
  const [previewItem, setPreviewItem] = useState<number | null>(null);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [RoomLoading, setRoomLoading] = useState(true)
  const [unpaidBills, setUnpaidBills] = useState(0);

  useEffect(() => {
    Promise.all([
      apiFetch("/rooms", { method: "GET", credentials: "include" }).then((res) => res.json()),
      apiFetch("/roomtype", { method: "GET", credentials: "include" }).then((res) => res.json()),
    ])
      .then(([roomsData, roomTypes]) => {
        const typeMap: Record<string, number> = {};
        roomTypes.forEach((rt: any) => {
          typeMap[rt.roomtypeid] = rt.roomprice;
        });

        const nda = roomsData.rooms.map((item: any) => ({
          id: item.id,
          roomNumber: item.roomName,
          floor: item.floor,
          type: item.roomTypeId,
          status: item.renterID ? "occupied" : "vacant",
          tenantId: item.renterID,
          monthlyRent: typeMap[item.roomTypeId] || 0,
        }));
        setRoom(nda);
        setRoomLoading(false);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (RoomLoading) return
    apiFetch("/bills", {
      method: "GET",
      credentials: "include",
    })
      .then((js) => {
        return js.json();
      })
      .then((data) => {
        if (data.length == 0) return setLoading(false);
        const newdata = data.map((s: any) => {
          return {
            id: s.BillID,
            roomNumber: rooms!.find((v) => v.id === s.RoomID)?.roomNumber,
            month: format(new Date(s.billMonth), "MMM yyyy"),
            electric: Number.parseFloat(s.electricprice),
            water: Number.parseFloat(s.waterprice),
            additionalFees: JSON.parse(s.additionalFees) as AdditionalFee[],
            roomFee: s.roomprice,
            status: s.billStatus == 2 ? "paid" : "unpaid",
            dueDate: new Date(s.DueDate),
            paidDate: s.paidDate && new Date(s.paidDate),
            imageFile: s.transactionimg,
          } as UtilityRecord;
        });
        setUtilityData(newdata);
        setLoading(false)
      });
  }, [RoomLoading]);

  useEffect(() => {
    if (RoomLoading) return
    if (newUtility.roomNumber) {
      const selectedRoom = rooms!.find(
        (room) => room.roomNumber === newUtility.roomNumber
      );


      if (selectedRoom) {
        setNewUtility({
          ...newUtility,
          roomFee: selectedRoom.monthlyRent || 0,
        });
      }

      if (newUtility.month && newUtility.month !== oldmonth) {
        oldmonth = newUtility.month;

        setNewUtility((prevUtility) => ({
          ...prevUtility,
          additionalFees: [],
        }));

        apiFetch(
          `/tasks?roomid=${rooms!.find((i) => i.roomNumber == newUtility.roomNumber)?.id
          }&month=${newUtility.month}`,
          { method: "GET", credentials: "include" }
        )
          .then((jso) => jso.json())
          .then((value) => {
            if (value.length) {
              const newFees = value.map((s: any) => {
                return {
                  amount: Number.parseFloat(s.taskprice),
                  description: `จากการจ้าง ${s.taskname} ` + s.description,
                  type: s.tasktype == "housekeeping" ? "housewife" : "fixing",
                } as AdditionalFee;
              });

              setNewUtility((prevUtility) => ({
                ...prevUtility,
                additionalFees: [
                  ...newFees,
                  ...feenotfromfetch,
                ],
              }));
            } else {
              setNewUtility((prevUtility) => ({
                ...prevUtility,
                additionalFees: [...feenotfromfetch],
              }));
            }
          });
      }
    }

  }, [RoomLoading, newUtility.roomNumber, newUtility.month, rooms]);

  useEffect(() => {
    apiFetch('/main/bill/', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => setUnpaidBills(data.unpaidBills))
      .catch(console.error);
  }, []);

  const handleConfirmPayment = (id: number) => {
    const item = utilityData.find((item) => item.id === id);
    apiFetch(`/bills/${id}/confirmPayment`, {
      method: "PUT",
      credentials: "include",
    }).catch((ex) => {
      console.error(ex);
    });
    if (!item) return;

    setUtilityData(
      utilityData.map((item) =>
        item.id === id
          ? { ...item, status: "paid", paidDate: new Date() }
          : item
      )
    );

    setIsReceiptDialogOpen(false);

    setPreviewItem(null);
  };

  const months = [...new Set(utilityData.map((item) => item.month))].sort(
    (a, b) => {
      const [aMonth, aYear] = a.split(" ");
      const [bMonth, bYear] = b.split(" ");
      return new Date(`${aMonth} 1, ${aYear}`) <
        new Date(`${bMonth} 1, ${bYear}`)
        ? 1
        : -1;
    }
  );

  const filteredData = utilityData.filter((item) => {
    const matchesSearch = item.roomNumber
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesMonth = filterMonth === "all" || item.month === filterMonth;

    const matchesStatus =
      filterStatus === "all" || item.status === filterStatus;

    return matchesSearch && matchesMonth && matchesStatus;
  });

  // Handle adding new fee to the utility record
  const handleAddFee = () => {
    if (newFee.amount <= 0 || !newFee.description.trim()) {
      alert("Please enter a valid amount and description");
      return;
    }
    setFeenotfromfetch([
      ...feenotfromfetch,
      { ...newFee, amount: Number(newFee.amount) },
    ]);
    setNewUtility({
      ...newUtility,
      additionalFees: [
        ...newUtility.additionalFees,
        { ...newFee, amount: Number(newFee.amount) },
      ],
    });

    setNewFee({
      type: "housewife",
      amount: 0,
      description: "",
    });
    setShowAddFee(false);
  };


  const handleRemoveFee = (index: number) => {
    const updatedFees = [...newUtility.additionalFees];
    updatedFees.splice(index, 1);
    setNewUtility({
      ...newUtility,
      additionalFees: updatedFees,
    });
  };
  function feetypetranslate(feeType: any) {
    switch (feeType) {
      case "housewife":
        return "จ้างแม่บ้าน";
      case "fixing":
        return "จ้างซ่อมแซม";
      case "laundry":
        return "จ้างซักรีด";
      case "internet":
        return "ค่าบริการอินเตอร์เน็ต";
      default:
        return "อื่นๆ";
    }
  }
  const handleAddUtility = () => {
    if (
      !newUtility.roomNumber ||
      newUtility.electric < 0 ||
      newUtility.water < 0
    ) {
      toast.error("กรุณาใส่ข้อมูลให้ถูกต้อง");
      return;
    }

    if (!rooms!.find((room) => room.roomNumber === newUtility.roomNumber)) {
      toast.error("ไม่มีห้องหมายเลขนี้");
      return;
    }

    const duplicate = utilityData.find(
      (item) =>
        item.roomNumber === newUtility.roomNumber &&
        item.month === newUtility.month
    );

    if (duplicate) {
      toast.error(
        `ค่าสาธารณูประโภคของห้อง ${newUtility.roomNumber} ในเดือน ${newUtility.month} มีอยู่แล้ว`
      );
      return;
    }
    const taskprice: number = newUtility.additionalFees.reduce(
      (accumulator: number, currentValue: AdditionalFee) => {
        return accumulator + currentValue.amount;
      },
      0
    );
    const RoomID = rooms!.find(
      (v) => v.roomNumber === newUtility.roomNumber
    )?.id;
    const roomprice = rooms!.find(
      (v) => v.roomNumber === newUtility.roomNumber
    )?.monthlyRent;
    apiFetch("/bills", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        RoomID,
        billMonth: newUtility.month,
        DueDate: newUtility.dueDate,
        waterprice: newUtility.water,
        electricprice: newUtility.electric,
        taskprice,
        roomprice,
        additionalFees: newUtility.additionalFees,
      }),
    }).catch((ex) => {
      console.error(ex);
    }
    );



    // Add new utility record
    const newItem = {
      ...newUtility,
      id: Math.max(...utilityData.map((item) => item.id), 0) + 1,
      electric: Number(newUtility.electric),
      water: Number(newUtility.water),
      roomFee: newUtility.roomFee,
    };

    setUtilityData([newItem, ...utilityData]);
    setIsAddDialogOpen(false);
    setNewUtility({
      id: 0,
      roomNumber: "",
      roomFee: 0,
      month: format(new Date(), "MMM yyyy"),
      electric: 0,
      water: 0,
      additionalFees: [],
      status: "unpaid",
      dueDate: new Date(new Date().setDate(15)),
    });
  };

  const currentMonth =
    new Date().toLocaleString("default", { month: "short" }) +
    " " +
    new Date().getFullYear();
  const currentMonthData = utilityData.filter(
    (item) => item.month === currentMonth
  );

  let oldmonth = "";
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }


  const formatThaiDate = (date: Date): string => {
    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    const monthIndex = date.getMonth();
    const day = date.getDate();

    return `${day} ${thaiMonths[monthIndex]}`;
  };

  const formatThaiFullDate = (date: Date): string => {
    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    const monthIndex = date.getMonth();
    const day = date.getDate();
    const year = date.getFullYear() + 543;

    return `${day} ${thaiMonths[monthIndex]} ${year}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-auto">
      <div className="flex flex-1">
        <Sidebar />
        <main className="h-screen flex-1 overflow-auto">
          <div className="p-6 pt-16 md:pt-6">
            <div className="container mx-auto">
              {/* Header and Actions */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-0">
                  ติดตามค่าสาธารณูปโภค
                </h1>
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="text"
                      placeholder="ค้นหาหมายเลขห้องพัก..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-full"
                    />
                  </div>
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="w-full md:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    เพิ่มบิลใหม่
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">เดือนปัจจุบัน</p>
                      <p className="text-2xl font-bold">{currentMonth}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        บิลที่ยังไม่ได้ตรวจสอบ
                      </p>
                      <p className="text-2xl font-bold">{unpaidBills}</p>
                    </div>
                    <div className="bg-amber-100 p-3 rounded-full">
                      <X className="h-5 w-5 text-amber-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-3 mb-6">
                <Select value={filterMonth} onValueChange={setFilterMonth}>
                  <SelectTrigger className="w-full md:w-40">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {filterMonth === "all" ? "ทุกเดือน" : filterMonth}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกเดือน</SelectItem>
                    {months.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-40">
                    <div className="flex items-center">
                      <Check className="h-4 w-4 mr-2" />
                      <span>
                        {filterStatus === "all"
                          ? "ทุกสถานะ"
                          : filterStatus === "paid"
                            ? "ชำระแล้ว"
                            : "ยังไม่ได้ชำระ"}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกสถานะ</SelectItem>
                    <SelectItem value="paid">จ่ายแล้ว</SelectItem>
                    <SelectItem value="unpaid">ยังไม่จ่าย</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Utility Table */}
              {filteredData.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500 mb-4">ไม่พบรายการ</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("");
                        setFilterMonth("all");
                        setFilterStatus("all");
                      }}
                    >
                      ล้างฟิลเตอร์
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="bg-white rounded-md shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 text-left">
                          <th className="px-4 py-3 text-sm font-medium text-gray-700">
                            ห้อง
                          </th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-700">
                            เดือน
                          </th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-700">
                            ค่าไฟฟ้า (฿)
                          </th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-700">
                            ค่าน้ำ (฿)
                          </th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-700">
                            ค่าห้อง (฿)
                          </th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-700">
                            ค่าใช้จ่ายเพิ่มเติม
                          </th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-700">
                            ทั้งหมด (฿)
                          </th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-700">
                            ชำระภายในวันที่
                          </th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-700">
                            สถานะ
                          </th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-700">
                            ใบเสร็จ
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredData.map((item) => {
                          const additionalTotal = item.additionalFees.reduce(
                            (sum, fee) => sum + fee.amount,
                            0
                          );
                          const totalAmount =
                            Number(item.electric) +
                            Number(item.water) +
                            Number(additionalTotal) +
                            Number(item.roomFee);

                          return (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  <Home className="h-4 w-4 text-gray-500 mr-2" />
                                  {item.roomNumber}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                {item.month}
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                {item.electric.toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                {item.water.toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                {Number(item.roomFee).toLocaleString("th-TH", { maximumFractionDigits: 0 })}
                              </td>
                              <td className="px-4 py-3">
                                {additionalTotal > 0 ? (
                                  <div>
                                    <span className="font-medium text-gray-700">
                                      ฿{additionalTotal.toLocaleString()}
                                    </span>
                                    {item.additionalFees.length > 0 && (
                                      <div className="mt-1">
                                        {item.additionalFees.map(
                                          (fee, index) => (
                                            <Badge
                                              key={index}
                                              className="mr-1 mb-1 bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
                                            >
                                              {fee.type === "housewife" && (
                                                <ShowerHead className="h-3 w-3 mr-1 inline" />
                                              )}
                                              {fee.type === "fixing" && (
                                                <Wrench className="h-3 w-3 mr-1 inline" />
                                              )}
                                              {fee.type === "laundry" && (
                                                <Scissors className="h-3 w-3 mr-1 inline" />
                                              )}
                                              {feetypetranslate(fee.type)} ฿
                                              {fee.amount.toLocaleString()}
                                            </Badge>
                                          )
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-500 text-sm">
                                    -
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 font-medium text-gray-700">
                                {totalAmount.toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                {format(item.dueDate, "MMM d, yyyy")}
                              </td>
                              <td className="px-4 py-3">
                                <Badge
                                  className={
                                    item.status === "paid"
                                      ? "bg-green-50 text-green-600 border-green-200"
                                      : "bg-amber-50 text-amber-600 border-amber-200"
                                  }
                                >
                                  {item.status === "paid" && item.paidDate
                                    ? `ชำระเมื่อ ${formatThaiDate(item.paidDate)}`
                                    : "ยังไม่ได้ชำระ"}

                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                {item.status === "unpaid" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200"
                                    onClick={() => {
                                      setPreviewItem(item.id);
                                      setIsReceiptDialogOpen(true);
                                    }}
                                  >
                                    <Printer className="h-4 w-4 mr-1" />
                                    ตรวจสอบใบเสร็จ
                                  </Button>
                                )}
                                {item.status === "paid" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 hover:text-green-800 hover:bg-green-50 border-green-200"
                                    onClick={() => {
                                      setPreviewItem(item.id);
                                      setIsReceiptDialogOpen(true);
                                    }}
                                  >
                                    <Printer className="h-4 w-4 mr-1" />
                                    ดูใบเสร็จ
                                  </Button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <Footer />

      {/* Add New Utility Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>เพิ่มบิลชำระ</DialogTitle>
            <DialogDescription>เพิ่มบิลชำระสำหรับห้องพัก</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="roomNumber">หมายเลขห้อง *</Label>
              <Select
                value={newUtility.roomNumber}
                onValueChange={(value) =>
                  setNewUtility({ ...newUtility, roomNumber: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select room number" />
                </SelectTrigger>
                <SelectContent>
                  {rooms!.map((room) => (
                    <SelectItem key={room.roomNumber} value={room.roomNumber}>
                      ห้อง {room.roomNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomFee">ราคาห้อง (฿) *</Label>
              <div className="relative">
                <Home className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="roomFee"
                  type="number"
                  className="pl-9 bg-gray-50"
                  readOnly
                  value={newUtility.roomFee}
                />
              </div>
              <p className="text-xs text-gray-500">
                ราคาห้องจะถูกเพิ่มโดยอัตโนมัติ โดยอ้างอิงจากหมายเลขห้องที่เลือก
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="month">เดือน *</Label>
              <Select
                value={newUtility.month}
                onValueChange={(value) =>
                  setNewUtility({ ...newUtility, month: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกเดือน" />
                </SelectTrigger>
                <SelectContent>
                  {/* Current month and previous 2 months */}
                  {[0, -1, -2].map((offset) => {
                    const date = new Date();
                    date.setMonth(date.getMonth() + offset);
                    const monthYear = format(date, "MMM yyyy");
                    return (
                      <SelectItem key={monthYear} value={monthYear}>
                        {monthYear}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="electric">ค่าไฟฟ้า(฿) *</Label>
                <div className="relative">
                  <Zap className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="electric"
                    type="number"
                    className="pl-9"
                    min="0"
                    value={newUtility.electric}
                    onChange={(e) =>
                      setNewUtility({
                        ...newUtility,
                        electric: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="water">ค่าน้ำ (฿) *</Label>
                <div className="relative">
                  <Droplets className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="water"
                    type="number"
                    className="pl-9"
                    min="0"
                    value={newUtility.water}
                    onChange={(e) =>
                      setNewUtility({
                        ...newUtility,
                        water: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">ชำระภายในวันที่</Label>
              <Input
                id="dueDate"
                type="date"
                value={format(newUtility.dueDate, "yyyy-MM-dd")}
                onChange={(e) =>
                  setNewUtility({
                    ...newUtility,
                    dueDate: e.target.value
                      ? new Date(e.target.value)
                      : new Date(new Date().setDate(15)),
                  })
                }
              />
            </div>

            {/* Additional fees section */}
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <Label>ค่าใช้จ่ายเพิ่มเติม</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddFee(true)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  เพิ่มค่าบริการ
                </Button>
              </div>

              {/* List of additional fees */}
              {newUtility.additionalFees.length > 0 ? (
                <div className="space-y-2 mt-2">
                  {newUtility.additionalFees.map((fee, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
                    >
                      <div>
                        <div className="flex items-center">
                          <Badge className="capitalize mr-2">
                            {fee.type === "housewife" && (
                              <ShowerHead className="h-3 w-3 mr-1 inline" />
                            )}
                            {fee.type === "fixing" && (
                              <Wrench className="h-3 w-3 mr-1 inline" />
                            )}
                            {fee.type === "laundry" && (
                              <Scissors className="h-3 w-3 mr-1 inline" />
                            )}
                            {feetypetranslate(fee.type)}
                          </Badge>
                          <span className="font-medium">
                            ฿{fee.amount.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {fee.description}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveFee(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  ไม่มีค่าบริการเพิ่ม
                </p>
              )}

              {/* Add fee form */}
              {showAddFee && (
                <div className="space-y-3 bg-gray-50 p-3 rounded-md">
                  <div className="space-y-2">
                    <Label htmlFor="feeType">ประเภทค่าบริการ</Label>
                    <Select
                      value={newFee.type}
                      onValueChange={(value) =>
                        setNewFee({
                          ...newFee,
                          type: value as
                            | "housewife"
                            | "fixing"
                            | "internet"
                            | "other",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select fee type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="housewife">บริการแม่บ้าน</SelectItem>
                        <SelectItem value="fixing">บริการซ่อมแซม</SelectItem>
                        <SelectItem value="internet">
                          บริการอินเตอร์เน็ต
                        </SelectItem>
                        <SelectItem value="other">อื่นๆ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="feeAmount">ราคา (฿)</Label>
                      <Input
                        id="feeAmount"
                        type="number"
                        min="0"
                        value={newFee.amount}
                        onChange={(e) =>
                          setNewFee({
                            ...newFee,
                            amount: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="feeDescription">รายละเอียด</Label>
                      <Input
                        id="feeDescription"
                        value={newFee.description}
                        onChange={(e) =>
                          setNewFee({ ...newFee, description: e.target.value })
                        }
                        placeholder="เช่น ทำความสะอาดรายสัปดาห์"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddFee(false)}
                    >
                      ยกเลิก
                    </Button>
                    <Button type="button" size="sm" onClick={handleAddFee}>
                      เพิ่มค่าบริการ
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-md bg-blue-50 p-3 mt-4 text-xs text-blue-700">
              <div className="flex items-start gap-2">
                <PlusCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">
                    ยอดทั้งหมด: ฿
                    {(
                      Number(newUtility.electric) +
                      Number(newUtility.water) + Number(newUtility.roomFee) +
                      newUtility.additionalFees.reduce(
                        (sum, fee) => sum + Number(fee.amount),
                        0
                      )
                    ).toLocaleString()}
                  </p>
                  <p className="mt-1">
                    บิลชำระนี้จะถูกเพิ่มให้มีสถานะ "ยังไม่ได้ชำระ" โดยอัตโนมัติ
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleAddUtility}>
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มบิลชำระ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {previewItem &&
                utilityData.find((item) => item.id === previewItem)?.status ===
                "paid"
                ? "ดูใบเสร็จ"
                : "ตรวจสอบใบเสร็จ"}
            </DialogTitle>
            <DialogDescription>
              {previewItem &&
                utilityData.find((item) => item.id === previewItem)?.status ===
                "paid"
                ? "ใบเสร็จที่ตรวจสอบแล้ว"
                : "คอนเฟิร์มการจ่ายหลังตรวจสอบเสร็จ"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-4">
            <div className="relative w-full h-[500px] border rounded-md overflow-hidden shadow-md">
              {previewItem &&
                (() => {
                  const imageFile = utilityData.find(
                    (item) => item.id === previewItem
                  )?.imageFile;
                  return imageFile ? (
                    <img
                      src={imageFile}
                      alt="ใบเสร็จ"
                      className="object-contain w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">ไม่มีรูปภาพ</span>
                    </div>
                  );
                })()}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReceiptDialogOpen(false)}
            >
              ปิด
            </Button>

            {previewItem &&
              utilityData.find((item) => item.id === previewItem)?.status ===
              "unpaid" && (
                <Button
                  onClick={() => {
                    if (previewItem) {
                      handleConfirmPayment(previewItem);
                      setIsReceiptDialogOpen(false);
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  ยืนยันการชำระเงิน
                </Button>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UtilityPage;
