"use client";

import React, { useState, useEffect } from "react";
import SidebarUser from "@/components/SidebarUser";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import {
    Clock,
    Home,
    Smile,
    ImageIcon
    
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { toast } from "sonner";
import Image from "next/image";
import { apiFetch } from "@/lib/api";

interface Parcel {
    id: number;
    roomName: string;
    IncomingDate: Date;
    parcel_img?: File;
    previewUrl?: string;
}

const ParcelPage = () => {
    const [parcels, setParcels] = useState<Parcel[]>([]);
    const [previewImage, setPreviewImage] = useState<string | null>(null);


    useEffect(() => {
        const fetchParcels = async () => {
            try {
                const res = await apiFetch(`/room`, {
                    method: "GET",
                    credentials: "include",
                });

                const data = await res.json()

                const parsed = data.map((p: any) => ({
                    ...p,
                    IncomingDate: new Date(p.IncomingDate),
                    previewUrl: p.parcel_img ? p.parcel_img : null,
                }));

                setParcels(parsed);
            } catch (err) {
                console.error(err);
                toast.error("โหลดข้อมูลพัสดุล้มเหลว");
            }
        };
        fetchParcels();
    }, []);

    const pendingCount = parcels.length;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="flex flex-1">
                <SidebarUser />
                <main className="flex-1 overflow-auto">
                    <div className="p-6 pt-16 md:pt-6 container mx-auto">

                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
                            <h1 className="text-2xl font-bold">ติดตามพัสดุ</h1>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <Card>
                                <CardContent className="p-4 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-gray-500">จำนวนพัสดุที่ยังไม่ได้รับ</p>
                                        <p className="text-2xl font-bold">{pendingCount}</p>
                                    </div>
                                    <Clock className="h-6 w-6 text-amber-600" />
                                </CardContent>
                            </Card>
                        </div>
                        {/* Table */}
                        <div className="bg-white rounded-md shadow-sm overflow-hidden">
                            {parcels.length === 0 ? (
                                <p className="p-6 text-gray-500 text-center">
                                    <Smile/>ตอนนี้ยังไม่มีพัสดุมาเลย รอต่อไปอีกนิดนะ !
                                </p>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left">ID</th>
                                            <th className="px-4 py-3 text-left">ห้อง</th>
                                            <th className="px-4 py-3 text-left">รูปพัสดุ</th>
                                            <th className="px-4 py-3 text-left">วันที่รับเข้า</th>
                                            <th className="px-4 py-3 text-left">หมายเหตุ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {parcels.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">{item.id}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center">
                                                        <Home className="h-4 w-4 text-gray-500 mr-2" />
                                                        {item.roomName}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item.previewUrl ? (
                                                        <div
                                                            className="relative w-16 h-16 rounded-md overflow-hidden border cursor-pointer hover:opacity-80"
                                                            onClick={() => setPreviewImage(item.previewUrl!)}
                                                        >
                                                            <Image
                                                                src={item.previewUrl}
                                                                alt="พัสดุ"
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">ไม่มีรูป</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {format(item.IncomingDate, "dd/MM/yyyy")}
                                                </td>
                                                <td className="px-4 py-3">
                                                    สามารถติดต่อเพื่อรับพัสดุได้ที่เคาน์เตอร์ประชาสัมพันธ์
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            <Footer />

            {/* Dialog: Preview Image */}
            <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ImageIcon className="h-5 w-5" />
                            รูปพัสดุ
                        </DialogTitle>
                        <DialogDescription>กดปิดเพื่อกลับไปหน้าหลัก</DialogDescription>
                    </DialogHeader>
                    <div className="relative w-full h-[400px]">
                        {previewImage && (
                            <Image
                                src={previewImage}
                                alt="พัสดุ"
                                fill
                                className="object-contain rounded-md"
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ParcelPage;
