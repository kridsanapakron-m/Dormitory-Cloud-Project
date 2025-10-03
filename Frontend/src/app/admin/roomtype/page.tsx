"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { Search, Edit, Trash2, X, Check } from "lucide-react";

type RoomType = {
  id: number;
  roomtypeid: string;
  name: string;
  description: string;
  roomtypeimg: string;
  roomprice: number;
};

const RoomTypeManagementPage = () => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(
    null
  );
  const [formData, setFormData] = useState<Partial<RoomType>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // fetch roomtypes
  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      const res = await apiFetch("/roomtype", { method: "GET" });
      if (!res.ok) {
        toast.error("ดึงค่าประเภทห้องไม่สำเร็จ");
        return;
      }
      const data = await res.json();
      setRoomTypes(data);
    } catch (err) {
      console.error(err);
    }
  };

  // cleanup imagePreview URL
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "roomprice" ? Number(value) : value,
    }));
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files?.length) {
      const file = e.target.files[0];
      setImageFile(file);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(file));
      try {
        const base64 = await fileToBase64(file);
        setFormData((prev) => ({ ...prev, roomtypeimg: base64 }));
      } catch {
        setError("ประมวลผลรูปภาพล้มเหลว");
      }
    }
  };

  const resetDialog = () => {
    setIsDialogOpen(false);
    setSelectedRoomType(null);
    setFormData({});
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.roomtypeid || !formData.name || !formData.description) {
        setError("กรุณากรอกข้อมูลให้ครบ");
        return;
      }
      const method = selectedRoomType ? "PUT" : "POST";
      const url = selectedRoomType
        ? `/roomtype/${selectedRoomType.id}`
        : "/roomtype";

      const res = await apiFetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "ไม่สำเร็จ");
      }

      toast.success(
        selectedRoomType ? "แก้ไขประเภทห้องสำเร็จ" : "เพิ่มประเภทห้องสำเร็จ"
      );
      fetchRoomTypes();
      resetDialog();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedRoomType) return;
    try {
      const res = await apiFetch(`/roomtype/${selectedRoomType.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "ลบไม่สำเร็จ");
      }
      toast.success("ลบประเภทห้องสำเร็จ");
      fetchRoomTypes();
      setDeleteConfirm(false);
      resetDialog();
    } catch (err: any) {
      toast.error(err.message);
      setDeleteConfirm(false);
    }
  };

  const filtered = roomTypes.filter(
    (rt) =>
      rt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rt.roomtypeid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">จัดการประเภทห้อง</h1>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="ค้นหา..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button
                  onClick={() => {
                    setFormData({});
                    setSelectedRoomType(null);
                    setIsDialogOpen(true);
                    setError(null);
                  }}
                >
                  เพิ่มประเภทห้อง
                </Button>
              </div>
            </div>

            {/* grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((rt) => (
                <Card key={rt.id}>
                  <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                    <Image
                      src={rt.roomtypeimg || "/default-room.jpg"}
                      alt={rt.name || "room image"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardHeader>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {rt.roomtypeid}
                    </Badge>
                    <CardTitle>{rt.name}</CardTitle>
                    <CardDescription>{rt.description}</CardDescription>
                    <p className="text-sm text-gray-600">
                      ค่าเช่ารายเดือน: {rt.roomprice} บาท
                    </p>
                  </CardHeader>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full flex gap-2"
                      onClick={() => {
                        setSelectedRoomType(rt);
                        setFormData(rt);
                        setImagePreview(rt.roomtypeimg || null);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                      แก้ไข
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="p-8 text-center text-gray-500 bg-white rounded-lg">
                ไม่พบประเภทห้อง
              </div>
            )}
          </div>
          <Footer />
        </main>
      </div>

      {/* add/edit dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && resetDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedRoomType ? "แก้ไขประเภทห้อง" : "เพิ่มประเภทห้อง"}
            </DialogTitle>
            <DialogDescription>
              ระบุข้อมูลประเภทห้องและอัพโหลดรูป
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            {error && <div className="text-red-500">{error}</div>}
            <div>
              <Label>รหัสประเภทห้อง</Label>
              <Input
                name="roomtypeid"
                value={formData.roomtypeid || ""}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label>ชื่อประเภทห้อง</Label>
              <Input
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label>คำอธิบาย</Label>
              <Textarea
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label>ค่าเช่ารายเดือน (บาท)</Label>
              <Input
                type="number"
                name="roomprice"
                value={formData.roomprice ?? ""}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label>รูปภาพ</Label>
              {imagePreview && (
                <div className="relative w-full h-40 mb-2">
                  <Image
                    src={imagePreview || "/default-room.jpg"}
                    alt="preview"
                    fill
                    className="object-cover rounded"
                  />
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetDialog}>
              <X className="mr-2 h-4 w-4" /> ยกเลิก
            </Button>
            {selectedRoomType && (
              <Button
                variant="destructive"
                onClick={() => setDeleteConfirm(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> ลบ
              </Button>
            )}
            <Button onClick={handleSubmit}>
              <Check className="mr-2 h-4 w-4" /> บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* delete confirm */}
      <Dialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบ</DialogTitle>
          </DialogHeader>
          <p>คุณแน่ใจหรือไม่ว่าจะลบประเภทห้องนี้?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(false)}>
              ยกเลิก
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              ยืนยันการลบ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomTypeManagementPage;
