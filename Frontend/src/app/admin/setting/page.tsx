"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { MapPin, Link, Building2, Phone, Mail, Facebook, Instagram } from "lucide-react";

interface SystemSettings {
  name: string;
  location: string;
  googleMap: string;
  phone: string;
  email: string;
  facebook: string;
  instagram: string;
}

const SettingsPage = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    name: "",
    location: "",
    googleMap: "",
    phone: "",
    email: "",
    facebook: "",
    instagram: "",
  });

  const [loading, setLoading] = useState(false);

  // init
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiFetch("/", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();

        setSettings(prev => ({
          ...prev,
          ...data,
          googleMap: data.google_map || "",
        }));
      } catch (error) {
        console.error(error);
        toast.error("โหลดการตั้งค่าล้มเหลว");
      }
    };
    fetchSettings();
  }, []);

  //save
  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("บันทึกไม่สำเร็จ");

      toast.success("บันทึกการตั้งค่าเรียบร้อยแล้ว");
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6 pt-16 md:pt-6 container mx-auto">
            <h1 className="text-2xl font-bold mb-6">ตั้งค่าระบบ</h1>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>ข้อมูลทั่วไป</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* System Name */}
                <div>
                  <Label>ชื่อระบบ</Label>
                  <div className="relative">
                    <Building2 className="absolute left-2.5 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      className="pl-9"
                      type="text"
                      value={settings.name}
                      onChange={(e) =>
                        setSettings({ ...settings, name: e.target.value })
                      }
                      placeholder="เช่น Dormitory Management"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <Label>สถานที่ตั้ง</Label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      className="pl-9"
                      type="text"
                      value={settings.location}
                      onChange={(e) =>
                        setSettings({ ...settings, location: e.target.value })
                      }
                      placeholder="เช่น 123 ถนนบางนา กรุงเทพฯ"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <Label>เบอร์โทรศัพท์</Label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      className="pl-9"
                      type="text"
                      value={settings.phone}
                      onChange={(e) =>
                        setSettings({ ...settings, phone: e.target.value })
                      }
                      placeholder="เช่น 081-234-5678"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <Label>อีเมล</Label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      className="pl-9"
                      type="email"
                      value={settings.email}
                      onChange={(e) =>
                        setSettings({ ...settings, email: e.target.value })
                      }
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                {/* Facebook */}
                <div>
                  <Label>Facebook</Label>
                  <div className="relative">
                    <Facebook className="absolute left-2.5 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      className="pl-9"
                      type="url"
                      value={settings.facebook}
                      onChange={(e) =>
                        setSettings({ ...settings, facebook: e.target.value })
                      }
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>
                </div>

                {/* Instagram */}
                <div>
                  <Label>Instagram</Label>
                  <div className="relative">
                    <Instagram className="absolute left-2.5 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      className="pl-9"
                      type="url"
                      value={settings.instagram}
                      onChange={(e) =>
                        setSettings({ ...settings, instagram: e.target.value })
                      }
                      placeholder="https://instagram.com/yourprofile"
                    />
                  </div>
                </div>

                {/* Google Map Link */}
                <div>
                  <Label>ลิงก์ Google Map</Label>
                  <div className="relative">
                    <Link className="absolute left-2.5 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      className="pl-9"
                      type="url"
                      value={settings.googleMap}
                      onChange={(e) =>
                        setSettings({ ...settings, googleMap: e.target.value })
                      }
                      placeholder="วางลิงก์ Google Map ที่นี่"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      กรุณาใช้ลิงก์ <span className="font-medium">Embed</span> เท่านั้น  
                      (Google Maps → Share → Embed a map → Copy HTML → ใช้เฉพาะค่า <code>src</code>)
                    </p>
                    {settings.googleMap && (
                      <div className="mt-4 rounded-xl overflow-hidden shadow-md">
                        <iframe
                          src={settings.googleMap}
                          className="w-full h-80 border-0"
                          loading="lazy"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default SettingsPage;
