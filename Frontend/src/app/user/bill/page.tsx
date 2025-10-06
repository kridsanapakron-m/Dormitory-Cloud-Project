"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Calendar,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Receipt,
  FileText,
  Eye,
  CreditCard,
  Upload,
  Check,
} from "lucide-react";
import Image from "next/image";
import SidebarUser from "@/components/SidebarUser";
import Footer from "@/components/Footer";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Transaction = {
  id: number;
  paidDate: Date;
  forMonth: string;
  totalAmount: number;
  receiptUrl?: string;
  status: "pending" | "paid" | string;
  paymentDate?: Date;
  breakdown?: {
    rent: number;
    water: number;
    electricity: number;
    other?: number;
    service?: number;
    maintenance?: number;
  };
};


type PaymentStep = "details" | "payment" | "confirmation";

interface QrPayment {
  base64url: string;
  promptpayid: string;
}

const BillPage = () => {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  useEffect(() => {
    apiFetch("/bills", {
      method: "GET",
      credentials: "include",
    })
      .then((val) => {
        if (val.status == 403) return router.push("/login");
        return val.json();
      })
      .then((data) => {
        const transformedBills = data.map((billData: any) => {
          const paidDate = new Date(billData.DueDate);
          const forMonth = new Date(billData.billMonth).toLocaleString("th-TH", {
            month: "long",
            year: "numeric",
          }); 

          const totalAmount =
            parseFloat(billData.roomprice) +
            parseFloat(billData.waterprice) +
            parseFloat(billData.electricprice) +
            parseFloat(billData.taskprice);

          const status = billData.billStatus === 0 ? "pending" : "paid";

          const breakdown = {
            rent: parseFloat(billData.roomprice),
            water: parseFloat(billData.waterprice),
            electricity: parseFloat(billData.electricprice),
            other: parseFloat(billData.taskprice),
          };
          return {
            id: billData.BillID,
            paidDate,
            forMonth,
            totalAmount: totalAmount.toFixed(2),
            status,
            paymentDate:billData.paidDate ? new Date(billData.paidDate) : null, // Use the same paidDate for paymentDate (or modify if needed)
            receiptUrl:
              billData.billStatus !== 0 &&
              billData.transactionimg,
            breakdown,
          };
        });
        setTransactions(transformedBills);
      });
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [paymentStep, setPaymentStep] = useState<PaymentStep>("details");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [qr, setQr] = useState<QrPayment | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (paymentStep !== "payment") return;
    apiFetch(`/bills/${selectedTransaction?.id}/qr`, {
      method: "GET",
      credentials: "include",
    })
      .then((v) => v.json())
      .then((data) => {
        setQr({
          base64url: data.base64url,
          promptpayid: data.promptpayid,
        } as QrPayment);
      })
      .catch((ex) => {});
  }, [paymentStep]);
  // Filter transactions based on search term
  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.forMonth.toLowerCase().includes(searchTerm.toLowerCase()) ||
      format(transaction.paidDate, "dd/MM/yyyy").includes(searchTerm)
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Handle page changes
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));

  // View transaction details
  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setPaymentStep("details");

    // If the transaction is already paid, skip to confirmation
    if (transaction.status === "paid") {
      setPaymentStep("confirmation");
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPaymentFile(e.target.files[0]);
    }
  };

  // helper function แปลงไฟล์เป็น base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file); // จะได้ string เช่น "data:image/png;base64,iVBORw0..."
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const handleConfirmPayment = async () => {
  if (!selectedTransaction || !paymentFile) return;

  try {
    const base64String = await fileToBase64(paymentFile);

    const response = await apiFetch(`/bills/${selectedTransaction.id}/paying`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transactionImgBase64: base64String,
      }),
    });

    if (!response.ok) {
      toast.error("อัพโหลดไม่สำเร็จ");
      return;
    }

    const updatedTransactions = transactions.map((transaction) =>
      transaction.id === selectedTransaction.id
        ? {
            ...transaction,
            status: "paid",
            paidDate: new Date(),
            receiptUrl: base64String,
          }
        : transaction
    );

    setTransactions(updatedTransactions);
    toast.success("การชำระเงินสำเร็จ", {
      description: `ชำระเงินค่าเช่าเดือน ${selectedTransaction.forMonth} เรียบร้อยแล้ว`,
    });

    setPaymentFile(null);
    setPaymentStep("confirmation");
    setSelectedTransaction(
      updatedTransactions.find((t) => t.id === selectedTransaction.id) || null
    );
  } catch (err) {
    console.error(err);
    toast.error("เกิดข้อผิดพลาดในการอัพโหลดสลิป");
  }
};



  const handleDownloadReceipt = async (transaction: Transaction) => {
    if (!transaction || !transaction.receiptUrl) {
      toast.error("ไม่พบไฟล์สลิป", {
        description: "ไม่สามารถดาวน์โหลดสลิปได้ เนื่องจากไม่พบไฟล์"
      });
      return;
    }
  
    try {
      const receiptUrl = transaction.receiptUrl;
      const filename = `receipt-${transaction.forMonth.replace(/\s+/g, '-')}.jpg`;
  
      if (receiptUrl.startsWith('/') || receiptUrl.startsWith('blob:')) {
        const a = document.createElement('a');
        a.href = receiptUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        toast.success("ดาวน์โหลดสลิปสำเร็จ");
        return;
      }
      
      try {
        const response = await apiFetch(receiptUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success("ดาวน์โหลดสลิปสำเร็จ");
      } catch (error) {
        window.open(receiptUrl, '_blank');
        toast.success("สลิปถูกเปิดในแท็บใหม่");
      }
    } catch (error) {
      console.error("Error downloading receipt:", error);
      toast.error("ไม่สามารถดาวน์โหลดสลิปได้", {
        description: "กรุณาลองใหม่อีกครั้ง"
      });
    }
  };

  // Reset dialog state when closed
  const handleDialogClose = () => {
    if (!isDialogOpen) {
        // setPaymentStep("details");
        setPaymentFile(null);
    }
  };

  // Generate unique payment reference
  const getPaymentReference = (transaction: Transaction) => {
    return `DORM${transaction.id}${transaction.paidDate.getFullYear()}${(
      transaction.paidDate.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex flex-1">
        <SidebarUser />

        <main className="flex-1 p-6 pt-16 md:pt-6 overflow-auto">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0 flex items-center">
                <Receipt className="w-6 h-6 mr-2 text-primary" />
                จ่ายค่าเช่า
              </h1>
              <div className="flex gap-3">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="ค้นหาตามเดือนหรือวันที่..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-full"
                  />
                </div>
              </div>
            </div>

            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  รายการที่ต้องชำระเงินทั้งหมด
                </CardTitle>
                <CardDescription>
                  ตรวจสอบการจ่ายค่าค่าใช้จ่ายรายเดือนที่ต้องจ่าย
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                          จ่ายภายในวันที่
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          สำหรับเดือน
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          จำนวนเงิน
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          สถานะ
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ดำเนินการ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentTransactions.map((transaction) => (
                        <tr
                          key={transaction.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                              {format(transaction.paidDate, "d MMMM yyyy", {
                                locale: th,
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.forMonth}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(transaction.totalAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              variant="outline"
                              className={
                                transaction.status === "paid"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-yellow-50 text-yellow-700 border-yellow-200"
                              }
                            >
                              {transaction.status === "paid"
                                ? "จ่ายแล้ว"
                                : "รอชำระ"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            <Dialog
                              open={
                                isDialogOpen &&
                                selectedTransaction?.id === transaction.id
                              }
                              onOpenChange={(open) => {
                                setIsDialogOpen(open);
                                handleDialogClose();
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant={
                                    transaction.status === "paid"
                                      ? "outline"
                                      : "ghost"
                                  }
                                  size="sm"
                                  className={
                                    transaction.status === "paid"
                                      ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                                      : "text-primary hover:text-primary-dark hover:bg-primary/10"
                                  }
                                  onClick={() => handleViewDetails(transaction)}
                                >
                                  {transaction.status === "paid" ? (
                                    <>
                                      <Eye className="h-4 w-4 mr-1" />
                                      ดูรายละเอียด
                                    </>
                                  ) : (
                                    <>
                                      <CreditCard className="h-4 w-4 mr-1" />
                                      จ่ายเงิน
                                    </>
                                  )}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                {/* Step 1: Transaction Details */}
                                {paymentStep === "details" && (
                                  <>
                                    <DialogHeader>
                                      <DialogTitle>
                                        รายละเอียดการชำระเงิน
                                      </DialogTitle>
                                      <DialogDescription>
                                        ค่าเช่าและค่าสาธารณูปโภคสำหรับเดือน{" "}
                                        {selectedTransaction?.forMonth}
                                      </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4 py-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-sm text-gray-500">
                                            วันสุดท้ายในการชำระ
                                          </p>
                                          <p className="font-medium">
                                            {selectedTransaction &&
                                              format(
                                                selectedTransaction.paidDate,
                                                "d MMMM yyyy",
                                                { locale: th }
                                              )}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-500">
                                            สำหรับเดือน
                                          </p>
                                          <p className="font-medium">
                                            {selectedTransaction?.forMonth}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-500">
                                            ยอดรวมทั้งหมด
                                          </p>
                                          <p className="font-medium text-lg text-primary">
                                            {selectedTransaction &&
                                              formatCurrency(
                                                selectedTransaction.totalAmount
                                              )}
                                          </p>
                                        </div>
                                      </div>

                                      {selectedTransaction?.breakdown && (
                                        <div className="border rounded-md p-4 bg-gray-50 mt-4">
                                          <h3 className="font-medium mb-3">
                                            รายละเอียดค่าใช้จ่าย
                                          </h3>
                                          <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                              <span>ค่าเช่า</span>
                                              <span>
                                                {formatCurrency(
                                                  selectedTransaction.breakdown
                                                    .rent
                                                )}
                                              </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                              <span>ค่าน้ำ</span>
                                              <span>
                                                {formatCurrency(
                                                  selectedTransaction.breakdown
                                                    .water
                                                )}
                                              </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                              <span>ค่าไฟ</span>
                                              <span>
                                                {formatCurrency(
                                                  selectedTransaction.breakdown
                                                    .electricity
                                                )}
                                              </span>
                                            </div>
                                            {selectedTransaction.breakdown
                                              .service && (
                                              <div className="flex justify-between items-center">
                                                <span>ค่าแม่บ้าน</span>
                                                <span>
                                                  {formatCurrency(
                                                    selectedTransaction
                                                      .breakdown.service
                                                  )}
                                                </span>
                                              </div>
                                            )}
                                            {selectedTransaction.breakdown
                                              .maintenance && (
                                              <div className="flex justify-between items-center">
                                                <span>ค่าช่าง</span>
                                                <span>
                                                  {formatCurrency(
                                                    selectedTransaction
                                                      .breakdown.maintenance
                                                  )}
                                                </span>
                                              </div>
                                            )}
                                            {selectedTransaction.breakdown
                                              .other && (
                                              <div className="flex justify-between items-center">
                                                <span>ค่าอื่นๆ</span>
                                                <span>
                                                  {formatCurrency(
                                                    selectedTransaction
                                                      .breakdown.other
                                                  )}
                                                </span>
                                              </div>
                                            )}
                                            <div className="border-t pt-2 mt-2 flex justify-between items-center font-medium">
                                              <span>รวมทั้งหมด</span>
                                              <span>
                                                {formatCurrency(
                                                  selectedTransaction.totalAmount
                                                )}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    <DialogFooter className="flex justify-between">
                                      <Button
                                        variant="outline"
                                        onClick={() => setIsDialogOpen(false)}
                                      >
                                        ปิด
                                      </Button>
                                      {selectedTransaction?.status ===
                                        "pending" && (
                                        <Button
                                          onClick={() =>
                                            setPaymentStep("payment")
                                          }
                                        >
                                          ดำเนินการชำระเงิน
                                        </Button>
                                      )}
                                    </DialogFooter>
                                  </>
                                )}

                                {/* Step 2: Payment with QR Code */}
                                {paymentStep === "payment" &&
                                  selectedTransaction && (
                                    <>
                                      <DialogHeader>
                                        <DialogTitle>
                                          ชำระเงินผ่าน PromptPay QR Code
                                        </DialogTitle>
                                        <DialogDescription>
                                          สแกน QR Code ด้วยแอพธนาคารของท่าน
                                        </DialogDescription>
                                      </DialogHeader>

                                      <div className="space-y-6 py-4">
                                        <div className="text-center">
                                          <div className="mx-auto w-48 h-48 bg-white p-2 border rounded-md mb-3 flex items-center justify-center">
                                            <Image
                                              src={qr?.base64url ? qr.base64url : "/no-image.png"}
                                              width={200}
                                              height={200}
                                              alt="PromptPay QR Code"
                                              className="w-full h-full"
                                            />
                                            {/* In real implementation, replace with actual QR Code */}
                                          </div>
                                          <p className="text-sm text-gray-500 mb-1">
                                            ยอดเงินที่ต้องชำระ
                                          </p>
                                          <p className="font-medium text-lg text-primary mb-2">
                                            {formatCurrency(
                                              selectedTransaction.totalAmount
                                            )}
                                          </p>
                                          <p className="text-sm text-gray-500 mb-1">
                                            อ้างอิง
                                          </p>
                                          <p className="text-sm font-mono font-medium mb-6">
                                            {qr?.promptpayid || getPaymentReference(selectedTransaction)}
                                          </p>
                                        </div>

                                        <div className="space-y-3">
                                          <p className="text-sm font-medium">
                                            แนบสลิปการโอนเงิน
                                          </p>
                                          <div className="border-2 border-dashed rounded-md p-4 text-center">
                                            <input
                                              type="file"
                                              ref={fileInputRef}
                                              onChange={handleFileChange}
                                              className="hidden"
                                              accept="image/*,.pdf"
                                            />

                                            {!paymentFile ? (
                                              <div className="py-3">
                                                <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                                <p className="text-sm text-gray-500">
                                                  ลากไฟล์หรือ{" "}
                                                  <button
                                                    className="text-primary hover:text-primary-dark"
                                                    onClick={() =>
                                                      fileInputRef.current?.click()
                                                    }
                                                  >
                                                    เลือกไฟล์
                                                  </button>
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                  รองรับไฟล์ JPG, PNG, หรือ PDF
                                                </p>
                                              </div>
                                            ) : (
                                              <div className="py-3">
                                                <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                                <p className="text-sm text-gray-700 font-medium">
                                                  {paymentFile.name}
                                                </p>
                                                <button
                                                  className="text-xs text-primary hover:text-primary-dark mt-1"
                                                  onClick={() =>
                                                    fileInputRef.current?.click()
                                                  }
                                                >
                                                  เปลี่ยนไฟล์
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      <DialogFooter className="flex justify-between">
                                        <Button
                                          variant="outline"
                                          onClick={() =>
                                            setPaymentStep("details")
                                          }
                                        >
                                          ย้อนกลับ
                                        </Button>
                                        <Button
                                          onClick={handleConfirmPayment}
                                          disabled={!paymentFile}
                                        >
                                          ยืนยันการชำระเงิน
                                        </Button>
                                      </DialogFooter>
                                    </>
                                  )}

                                {/* Step 3: Confirmation */}
                                {paymentStep === "confirmation" &&
                                  selectedTransaction && (
                                    <>
                                      <DialogHeader>
                                        <DialogTitle>
                                          รายละเอียดการชำระเงิน
                                        </DialogTitle>
                                        <DialogDescription>
                                          ค่าเช่าและค่าสาธารณูปโภคสำหรับเดือน{" "}
                                          {selectedTransaction.forMonth}
                                        </DialogDescription>
                                      </DialogHeader>

                                      <div className="space-y-4 py-4">
                                        <div className="rounded-md bg-green-50 p-4 flex items-center gap-3">
                                          <Check className="h-5 w-5 text-green-500" />
                                          <div>
                                            <p className="font-medium text-green-800">
                                              ชำระเงินสำเร็จ
                                            </p>
                                            <p className="text-sm text-green-700">
                                              ชำระเมื่อ{" "}
                                              {selectedTransaction.paymentDate
                                                ? format(
                                                    selectedTransaction.paymentDate,
                                                    "d MMMM yyyy",
                                                    { locale: th }
                                                  )
                                                : format(
                                                    new Date(),
                                                    "d MMMM yyyy",
                                                    { locale: th }
                                                  )}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <p className="text-sm text-gray-500">
                                              สำหรับเดือน
                                            </p>
                                            <p className="font-medium">
                                              {selectedTransaction.forMonth}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-sm text-gray-500">
                                              ยอดรวมทั้งหมด
                                            </p>
                                            <p className="font-medium text-lg">
                                              {formatCurrency(
                                                selectedTransaction.totalAmount
                                              )}
                                            </p>
                                          </div>
                                        </div>

                                        {selectedTransaction.receiptUrl && (
                                          <div className="border rounded-md p-4 bg-gray-50">
                                            <h3 className="font-medium mb-3">
                                              สลิปการชำระเงิน
                                            </h3>
                                            <div className="aspect-video bg-gray-200 rounded-md overflow-hidden">
                                              {/* Display uploaded receipt image */}
                                              <Image
                                                src={
                                                  selectedTransaction.receiptUrl
                                                }
                                                alt="Payment receipt"
                                                width={500}
                                                height={300}
                                                className="w-full h-full object-contain"
                                              />
                                            </div>
                                            <div className="flex justify-end mt-3">
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="text-primary"
                                              onClick={() => handleDownloadReceipt(selectedTransaction)}
                                            >
                                              <Download className="h-4 w-4 mr-1" />
                                              ดาวน์โหลดสลิป
                                            </Button>
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      <DialogFooter>
                                        <Button
                                          onClick={() => {
                                            setIsDialogOpen(false);
                                            setPaymentStep("details");
                                          }}
                                        >
                                          ปิด
                                        </Button>
                                      </DialogFooter>
                                    </>
                                  )}
                              </DialogContent>
                            </Dialog>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Empty state */}
                {currentTransactions.length === 0 && (
                  <div className="px-6 py-10 text-center text-gray-500">
                    <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p>ไม่พบรายการชำระเงิน</p>
                    <p className="text-sm">
                      ลองค้นหาด้วยคำอื่น หรือดูรายการที่มีอยู่ทั้งหมด
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex items-center justify-between py-4 border-t">
                <div className="text-sm text-gray-500">
                  แสดง {indexOfFirstItem + 1}-
                  {Math.min(indexOfLastItem, filteredTransactions.length)} จาก{" "}
                  {filteredTransactions.length} รายการ
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNumber) => (
                      <Button
                        key={pageNumber}
                        variant={
                          pageNumber === currentPage ? "default" : "outline"
                        }
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => paginate(pageNumber)}
                      >
                        {pageNumber}
                      </Button>
                    )
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default BillPage;
