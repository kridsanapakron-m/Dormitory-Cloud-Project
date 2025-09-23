"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, CheckCircle, Clock, Home } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { toast } from "sonner";
import Image from "next/image";
import { apiFetch } from "@/lib/api";
import { da } from "date-fns/locale";

interface Parcel {
    id: number;
    roomName: string;
    IncomingDate: Date;
    parcel_img?: File;
    previewUrl?: string;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

const ParcelPage = () => {
    const [parcels, setParcels] = useState<Parcel[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const [newParcel, setNewParcel] = useState<Omit<Parcel, "id">>({
        roomName: "",
        IncomingDate: new Date(),
    });

    // ---------------------- //
    // Add new parcel
    // ---------------------- //
    const handleAddParcel = async () => {
        if (!newParcel.roomName) {
            toast.error("กรุณากรอกหมายเลขห้อง");
            return;
        }

        try {
            let parcelImgBase64: string | null = null;
            if (newParcel.parcel_img) {
                parcelImgBase64 = await fileToBase64(newParcel.parcel_img);
            }

            const res = await apiFetch('/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    roomName: newParcel.roomName,
                    IncomingDate: newParcel.IncomingDate.toISOString(),
                    parcel_img: parcelImgBase64,
                }),
            });

            if (!res.ok) throw new Error("เพิ่มพัสดุไม่สำเร็จ");
            const data = await res.json();

            const newItem: Parcel = {
                id: data.id || Math.max(0, ...parcels.map((p) => p.id)) + 1,
                ...newParcel,
                previewUrl: newParcel.previewUrl,
            };

            setParcels([newItem, ...parcels]);
            setIsAddDialogOpen(false);
            setNewParcel({
                roomName: "",
                IncomingDate: new Date(),
            });

            toast.success("เพิ่มพัสดุเรียบร้อย");
        } catch (error) {
            console.error(error);
            toast.error("เกิดข้อผิดพลาด");
        }
    };

    // ---------------------- //
    // Pickup 
    // ---------------------- //
    const handlePickup = async (id: number) => {
        try {
            const res = await apiFetch(`/delete/${id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!res.ok) throw new Error("ลบพัสดุไม่สำเร็จ");

            setParcels((prev) => prev.filter((p) => p.id !== id));
            toast.success("บันทึกการรับพัสดุแล้ว");
        } catch (err) {
            console.error(err);
            toast.error("เกิดข้อผิดพลาด ไม่สามารถลบได้");
        }
    };

    // ---------------------- //
    // Filter
    // ---------------------- //
    const filteredData = parcels.filter(
        (item) =>
            item.roomName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const fetchParcels = async () => {
            try {
                const res = await apiFetch("/all", {
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
                <Sidebar />
                <main className="flex-1 overflow-auto">
                    <div className="p-6 pt-16 md:pt-6 container mx-auto">
                    
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
                        <h1 className="text-2xl font-bold">จัดการพัสดุ</h1>

                        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto items-center">
                            {/* Search */}
                            <div className="relative w-full md:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="ค้นหาหมายเลขห้อง..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                            </div>

                            {/* Add button */}
                            <Button onClick={() => setIsAddDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" /> เพิ่มพัสดุ
                            </Button>
                        </div>
                        </div>
                        

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <Card>
                                <CardContent className="p-4 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-gray-500">จำนวนพัสดุคงเหลือ</p>
                                        <p className="text-2xl font-bold">{pendingCount}</p>
                                    </div>
                                    <Clock className="h-6 w-6 text-amber-600" />
                                </CardContent>
                            </Card>
                        </div>
                        {/* Table */}
                        <div className="bg-white rounded-md shadow-sm overflow-hidden">
                            {filteredData.length === 0 ? (
                                <p className="p-6 text-gray-500 text-center">
                                    ✅ ไม่มีพัสดุค้างอยู่
                                </p>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left">ID</th>
                                            <th className="px-4 py-3 text-left">ห้อง</th>
                                            <th className="px-4 py-3 text-left">รูปพัสดุ</th>
                                            <th className="px-4 py-3 text-left">วันที่รับเข้า</th>
                                            <th className="px-4 py-3 text-left">การจัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {filteredData.map((item) => (
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
                                                    <Button size="sm" onClick={() => handlePickup(item.id)}>
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        รับแล้ว
                                                    </Button>
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

            {/* Dialog: Add Parcel */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>เพิ่มพัสดุ</DialogTitle>
                        <DialogDescription>กรอกข้อมูลพัสดุใหม่</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <Label>ห้อง *</Label>
                            <Input
                                type="text"
                                value={newParcel.roomName}
                                onChange={(e) =>
                                    setNewParcel({ ...newParcel, roomName: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <Label>อัปโหลดรูปพัสดุ</Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setNewParcel({
                                            ...newParcel,
                                            parcel_img: file,
                                            previewUrl: URL.createObjectURL(file),
                                        });
                                    }
                                }}
                            />
                            {newParcel.previewUrl && (
                                <div className="relative w-24 h-24 mt-2 border rounded-md overflow-hidden">
                                    <Image
                                        src={newParcel.previewUrl}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>ยกเลิก</Button>
                        <Button onClick={handleAddParcel}>
                            <Plus className="h-4 w-4 mr-2" /> เพิ่มพัสดุ
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog: Preview Image */}
            <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>รูปพัสดุ</DialogTitle>
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
