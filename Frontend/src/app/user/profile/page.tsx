"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Home,
  Save,
  ArrowLeft,
  Eye,
  Key,
  EyeOff,
  Upload,
} from 'lucide-react';
import SidebarUser from '@/components/SidebarUser';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { apiFetch } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";


const EditProfilePage = () => {
  const router = useRouter();

  const [profile, setProfile] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    address: "",
    userimg: "",
    roomNumber: "",
    roomType: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isConfirmError, setIsConfirmError] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        const response = await apiFetch(`/auth/profile`, {
          headers: {
            'Content-Type': 'application/json',
          }, credentials: 'include',
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.status}`);
        }
        const data = await response.json();
        setProfile({
          firstname: data.firstname || "",
          lastname: data.lastname || "",
          email: data.email || "",
          phone: data.telephone || "",
          address: data.address || "",
          userimg: data.userImg || "",
          roomNumber: data.roomName || "",
          roomType: data.roomTypeId || ""
        });
        setImagePreview(data.userImg || "/profile/annonymous.jpg");
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (confirmPassword.length > 0) {
      setIsConfirmError(newPassword !== confirmPassword);
    } else {
      setIsConfirmError(false);
    }
  }, [newPassword, confirmPassword]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setProfile(prev => ({ ...prev, userimg: base64String }));
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
    }
  };


  const handlePasswordChange = async () => {
    if (newPassword.length < 8) {
      toast.error("รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("รหัสผ่านใหม่ทั้งสองไม่ตรงกัน");
      return;
    }

    try {
      const res = await apiFetch("/auth/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ");
        return;
      }

      toast.success("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");
      setIsPasswordDialogOpen(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      toast.error("เกิดข้อผิดพลาด");
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        firstname: profile.firstname,
        lastname: profile.lastname,
        email: profile.email,
        telephone: profile.phone,
        address: profile.address,
        userImg: profile.userimg || "",
      };
      const response = await apiFetch("/auth/edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      toast.success("อัพเดทข้อมูลผู้ใช้เรียบร้อยแล้ว");
      router.push("/user/main");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("เกิดข้อผิดพลายระหว่างการอัพเดทข้อมูลผู้ใช้");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return <div>กำลังโหลด...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex flex-1">
        <SidebarUser />

        <main className="flex-1 p-6 pt-16 md:pt-6 overflow-auto pb-16">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="mr-4 text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            ย้อนกลับ
          </Button>
          <div className="container mx-auto max-w-3xl">
            <div className="flex items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">แก้ไขโปรไฟล์</h1>
            </div>

            <form onSubmit={handleSubmit}>
              <Card className="mb-6 overflow-hidden">
                <CardHeader className="pb-0">
                  <CardTitle>ข้อมูลส่วนตัว</CardTitle>
                </CardHeader>

                <CardContent className="pt-6">
                  {/* Profile Image */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative w-32 h-32 overflow-hidden rounded-full border-4 border-primary/20 mb-4">
                      {imagePreview ? (
                        <Image
                          src={imagePreview}
                          alt={profile.firstname || "Profile image"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">ไม่มีรูปภาพ</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center">
                      <label
                        htmlFor="profileImage"
                        className="cursor-pointer bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-md flex items-center transition-colors"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        อัปโหลดรูปภาพ
                      </label>
                      <input
                        type="file"
                        id="profileImage"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
                      <div className="relative">
                        <div className="absolute left-3 top-3 text-gray-400">
                          <User className="h-4 w-4" />
                        </div>
                        <Input
                          id="firstname"
                          name="firstname"
                          value={profile.firstname}
                          onChange={handleInputChange}
                          className="pl-10"
                          placeholder="ชื่อ"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-1">นามสกุล</label>
                      <div className="relative">
                        <div className="absolute left-3 top-3 text-gray-400">
                          <User className="h-4 w-4" />
                        </div>
                        <Input
                          id="lastname"
                          name="lastname"
                          value={profile.lastname}
                          onChange={handleInputChange}
                          className="pl-10"
                          placeholder="นามสกุล"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                      <div className="relative">
                        <div className="absolute left-3 top-3 text-gray-400">
                          <Mail className="h-4 w-4" />
                        </div>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={profile.email}
                          onChange={handleInputChange}
                          className="pl-10"
                          placeholder="อีเมล"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                      <div className="relative">
                        <div className="absolute left-3 top-3 text-gray-400">
                          <Phone className="h-4 w-4" />
                        </div>
                        <Input
                          id="phone"
                          name="phone"
                          value={profile.phone}
                          onChange={handleInputChange}
                          className="pl-10"
                          placeholder="เบอร์โทรศัพท์"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
                      <div className="relative">
                        <div className="absolute left-3 top-3 text-gray-400">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <Textarea
                          id="address"
                          name="address"
                          value={profile.address}
                          onChange={handleInputChange}
                          className="pl-10 min-h-[80px]"
                          placeholder="ที่อยู่"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 mb-1">ห้องพัก</label>
                      <div className="relative">
                        <div className="absolute left-3 top-3 text-gray-400">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <Input
                          id="roomNumber"
                          name="roomNumber"
                          value={profile.roomNumber}
                          disabled
                          className="pl-10 bg-gray-50"
                          placeholder="หมายเลขห้อง"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="roomType" className="block text-sm font-medium text-gray-700 mb-1">ประเภทห้อง</label>
                      <div className="relative">
                        <div className="absolute left-3 top-3 text-gray-400">
                          <Home className="h-4 w-4" />
                        </div>
                        <Input
                          id="roomType"
                          name="roomType"
                          value={profile.roomType}
                          disabled
                          className="pl-10 bg-gray-50"
                          placeholder="ประเภทห้อง"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  onClick={() => setIsPasswordDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-colors"
                >
                  <Key className="w-4 h-4" />
                  เปลี่ยนรหัสผ่าน
                </Button>
                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>กำลังบันทึก...</>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        บันทึกข้อมูล
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>

      <Footer />
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เปลี่ยนรหัสผ่าน</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">

            {/* Old Password */}
            <div>
              <label className="text-sm font-medium block mb-1">รหัสผ่านเก่า</label>
              <div className="relative">
                <Input
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="text-sm font-medium block mb-1">รหัสผ่านใหม่</label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-medium block mb-1">ยืนยันรหัสผ่านใหม่</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pr-10 ${confirmPassword.length > 0
                    ? newPassword !== confirmPassword
                      ? "border-red-500"
                      : "border-green-500"
                    : ""
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">รหัสผ่านไม่ตรงกัน</p>
                )}
                {confirmPassword.length > 0 && newPassword === confirmPassword && (
                  <p className="text-green-600 text-sm mt-1">รหัสผ่านตรงกันแล้ว ✅</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPasswordDialogOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button onClick={handlePasswordChange} disabled={newPassword !== confirmPassword}>
              <Save className="w-4 h-4 mr-2" /> บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </div>
  );
};

export default EditProfilePage;