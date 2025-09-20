"use client"

import React, { useEffect, useState } from 'react';
import { 
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  Receipt,
  FileText,
  Eye,
} from 'lucide-react';
import SidebarUser from '@/components/SidebarUser';
import Footer from '@/components/Footer';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useRouter } from 'next/navigation';

type Transaction = {
  id: number;
  paidDate: Date;
  forMonth: string;
  totalAmount: number;
  receiptUrl?: string;
  breakdown?: {
    rent: number;
    water: number;
    electricity: number;
    service?: number;
    maintenance?: number;
    other?: number;
  };
};

const TransactionPage = () => {
  const router = useRouter()
  // Sample transaction data
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 1,
      paidDate: new Date(2025, 2, 15), // March 15, 2025
      forMonth: "มีนาคม 2025",
      totalAmount: 5800,
      receiptUrl: "/receipts/march2025.pdf",
      breakdown: {
        rent: 4500,
        water: 300,
        electricity: 800,
      },
    },
    {
      id: 2,
      paidDate: new Date(2025, 1, 14), // February 14, 2025
      forMonth: "กุมภาพันธ์ 2025",
      totalAmount: 5650,
      receiptUrl: "/receipts/feb2025.pdf",
      breakdown: {
        rent: 4500,
        water: 250,
        electricity: 700,
      },
    },
    {
      id: 3,
      paidDate: new Date(2025, 0, 15), // January 15, 2025
      forMonth: "มกราคม 2025",
      totalAmount: 6100,
      receiptUrl: "/receipts/jan2025.pdf",
      breakdown: {
        rent: 4500,
        water: 350,
        electricity: 950,
        other: 100,
      },
    },
    {
      id: 4,
      paidDate: new Date(2024, 11, 15), // December 15, 2024
      forMonth: "ธันวาคม 2024",
      totalAmount: 5900,
      receiptUrl: "/receipts/dec2024.pdf",
      breakdown: {
        rent: 4500,
        water: 300,
        electricity: 900,
      },
    },
    {
      id: 5,
      paidDate: new Date(2024, 10, 15), // November 15, 2024
      forMonth: "พฤศจิกายน 2024",
      totalAmount: 5750,
      receiptUrl: "/receipts/nov2024.pdf",
      breakdown: {
        rent: 4500,
        water: 250,
        electricity: 800,
      },
    },
    {
      id: 6,
      paidDate: new Date(2024, 9, 14), // October 14, 2024
      forMonth: "ตุลาคม 2024",
      totalAmount: 5850,
      receiptUrl: "/receipts/oct2024.pdf",
      breakdown: {
        rent: 4500,
        water: 300,
        electricity: 850,
      },
    },
  ]);
  useEffect(()=> {
    fetch("http://localhost:3000/bills/paid",{method:"GET",credentials: "include"}).then((val) => {
      if (val.status == 403) return router.push("/login");
      return val.json();
    })
    .then((data) => {
      const transformedBills = data.map((billData: any) => {
        // Format dates
        const paidDate = new Date(billData.DueDate); // Convert DueDate into paidDate
        const forMonth = new Date(billData.billMonth).toLocaleString("th-TH", {
          month: "long",
          year: "numeric",
        }); // Format month (e.g. "ตุลาคม 2024")

        // Calculate the total amount (assuming roomprice + waterprice + electricprice + taskprice)
        const totalAmount =
          parseFloat(billData.roomprice) +
          parseFloat(billData.waterprice) +
          parseFloat(billData.electricprice) +
          parseFloat(billData.taskprice);

        // Map bill status (assuming 0 means 'paid' and other statuses map to 'unpaid')
        const status = billData.billStatus === 0 ? "pending" : "paid";

        // Breakdown object
        const breakdown = {
          rent: parseFloat(billData.roomprice),
          water: parseFloat(billData.waterprice),
          electricity: parseFloat(billData.electricprice),
        };
        // Construct final response
        return {
          id: billData.BillID, // Use BillID as the ID
          paidDate, // Use the formatted date
          forMonth, // The month formatted in Thai
          totalAmount: totalAmount.toFixed(2), // Total amount rounded to 2 decimal places
          status,
          paymentDate: paidDate, // Use the same paidDate for paymentDate (or modify if needed)
          receiptUrl: billData.billStatus !== 0 && `data:image/jpeg;base64,${billData.transactionimg}`, // Example URL for the receipt
          breakdown,
        };
      });
      setTransactions(transformedBills)
    })
  },[])

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  // View transaction details
  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(amount);
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
                ประวัติการชำระเงิน
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
                <CardTitle className="text-lg">รายการชำระเงินทั้งหมด</CardTitle>
                <CardDescription>
                  ประวัติการชำระค่าห้องพักและค่าสาธารณูปโภคย้อนหลัง
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          วันที่ชำระ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          สำหรับเดือน
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          จำนวนเงิน
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ดูรายละเอียด
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentTransactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                              {format(transaction.paidDate, "d MMMM yyyy", { locale: th })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.forMonth}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(transaction.totalAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-primary hover:text-primary-dark hover:bg-primary/10"
                                  onClick={() => handleViewDetails(transaction)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  รายละเอียด
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>รายละเอียดการชำระเงิน</DialogTitle>
                                  <DialogDescription>
                                    ค่าเช่าและค่าสาธารณูปโภคสำหรับเดือน {transaction.forMonth}
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="space-y-4 py-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-gray-500">วันที่ชำระ</p>
                                      <p className="font-medium">
                                        {format(transaction.paidDate, "d MMMM yyyy", { locale: th })}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">สำหรับเดือน</p>
                                      <p className="font-medium">{transaction.forMonth}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">ยอดรวมทั้งหมด</p>
                                      <p className="font-medium text-lg text-primary">
                                        {formatCurrency(transaction.totalAmount)}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {transaction.breakdown && (
                                    <div className="border rounded-md p-4 bg-gray-50 mt-4">
                                      <h3 className="font-medium mb-3">รายละเอียดค่าใช้จ่าย</h3>
                                      <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                          <span>ค่าเช่า</span>
                                          <span>{formatCurrency(transaction.breakdown.rent)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span>ค่าน้ำ</span>
                                          <span>{formatCurrency(transaction.breakdown.water)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span>ค่าไฟ</span>
                                          <span>{formatCurrency(transaction.breakdown.electricity)}</span>
                                        </div>
                                        {transaction.breakdown.service && (
                                          <div className="flex justify-between items-center">
                                            <span>ค่าแม่บ้าน</span>
                                            <span>{formatCurrency(transaction.breakdown.service)}</span>
                                          </div>
                                        )}
                                        {transaction.breakdown.maintenance && (
                                          <div className="flex justify-between items-center">
                                            <span>ค่าช่าง</span>
                                            <span>{formatCurrency(transaction.breakdown.maintenance)}</span>
                                          </div>
                                        )}
                                        {transaction.breakdown.other && (
                                          <div className="flex justify-between items-center">
                                            <span>อื่นๆ</span>
                                            <span>{formatCurrency(transaction.breakdown.other)}</span>
                                          </div>
                                        )}
                                        <div className="border-t pt-2 mt-2 flex justify-between items-center font-medium">
                                          <span>รวมทั้งหมด</span>
                                          <span>{formatCurrency(transaction.totalAmount)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
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
                    <p className="text-sm">ลองค้นหาด้วยคำอื่น หรือดูรายการที่มีอยู่ทั้งหมด</p>
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                    <Button
                      key={pageNumber}
                      variant={pageNumber === currentPage ? "default" : "outline"}
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => paginate(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  ))}
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

export default TransactionPage;