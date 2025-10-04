"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search,
  Home,
  User,
  Edit,
  Trash2,
  Phone,
  Mail,
  Info,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { apiFetch } from "@/lib/api";

interface BasicUser {
  id: string;
  firstname: string;
  lastname: string;
  address?: string;
  telephone?: string;
  email?: string;
  userimg?: string;
}

interface Room {
  id: string;
  roomName: string;
  description: string;
  roomTypeId: number;
  floor: number;
  renterID: string | null;
  roomImg?: string;
  available: number;
}

const TenantsPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isAddTenantDialogOpen, setIsAddTenantDialogOpen] = useState(false);
  const [tenantDetails, setTenantDetails] = useState<BasicUser | null>(null);
  const [currentTenants, setCurrentTenants] = useState<
    Record<string, BasicUser>
  >({});
  const [newTenantEmail, setNewTenantEmail] = useState("");

  const fetchData = async (url: string, options: RequestInit = {}) => {
    const response = await apiFetch(url, {
      ...options,
      credentials: "include",
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.message || `HTTP error: ${response.status}`;
      throw new Error(errorMessage);
    }
    return await response.json();
  };

  const fetchRooms = async () => {
    try {
      const data = await fetchData(`/rooms`);
      if (Array.isArray(data.rooms)) {
        setRooms(data.rooms);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const fetchUserById = async (userId: string) => {
    try {
      const data = await fetchData(`/auth/id/${userId}`, {
        method: "GET",
      });
      data.id = userId;
      setTenantDetails(data);
      return data;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      setTenantDetails(null);
      return null;
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    const fetchInitialTenants = async () => {
      if (rooms.length > 0) {
        const newCurrentTenants: Record<string, BasicUser> = {};
        for (const room of rooms) {
          if (room.renterID) {
            const user = await fetchUserById(room.renterID);
            if (user) {
              newCurrentTenants[room.id] = user;
            }
          }
        }
        setCurrentTenants(newCurrentTenants);
      }
    };
    fetchInitialTenants();
  }, [rooms]);

  const filteredRooms = rooms.filter(
    (room) =>
      room.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.renterID &&
        (currentTenants[room.id]?.firstname
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
          currentTenants[room.id]?.lastname
            .toLowerCase()
            .includes(searchTerm.toLowerCase())))
  );

  const handleOpenRoomDetails = (roomId: string) => {
    setSelectedRoomId(roomId);
    setIsUserDialogOpen(true);
  };

  const handleDeleteTenant = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTenant = async () => {
    if (!selectedRoomId) return;
    const room = rooms.find((r) => r.id === selectedRoomId);
    if (!room) return;
    try {
      await fetchData(`/rooms/${room.id}/removetenant`, { method: "PUT" });
      setRooms((prevRooms) =>
        prevRooms.map((r) =>
          r.id === room.id ? { ...r, renterID: null, available: 0 } : r
        )
      );
      setTenantDetails(null);
      setCurrentTenants((prev) => {
        const updated = { ...prev };
        delete updated[selectedRoomId];
        return updated;
      });
      setIsDeleteDialogOpen(false);
      setIsUserDialogOpen(false);
    } catch (error) {
      console.error("Error deleting tenant:", error);
    }
  };

  const confirmAddTenant = async () => {
    if (!selectedRoomId || !newTenantEmail) return;
    const room = rooms.find((r) => r.id === selectedRoomId);
    if (!room) return;
    try {
      const res = await fetchData(`/rooms/${room.id}/assign`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newTenantEmail }),
      });
      setRooms((prevRooms) =>
        prevRooms.map((r) =>
          r.id === room.id ? { ...r, renterID: res.userId, available: 1 } : r
        )
      );
      setIsAddTenantDialogOpen(false);
      setIsUserDialogOpen(false);
      setNewTenantEmail("");
    } catch (error) {
      console.error("Error adding tenant:", error);
    }
  };

  const cancelDeleteTenant = () => {
    setIsDeleteDialogOpen(false);
  };

  const roomsByFloor = filteredRooms.reduce((acc, room) => {
    if (!acc[room.floor]) {
      acc[room.floor] = [];
    }
    acc[room.floor].push(room);
    return acc;
  }, {} as Record<number, Room[]>);

  const sortedFloors = Object.keys(roomsByFloor)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-auto">
      <div className="flex flex-1">
        <Sidebar />
        <main className="h-screen flex-1 overflow-auto">
          <div className="p-6 pt-16 md:pt-6">
            <div className="container mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-0">
                  จัดการผู้เช่า
                </h1>
                <div className="flex gap-3">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="text"
                      placeholder="ค้นหาห้องหรือผู้เช่า..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-full"
                    />
                  </div>
                </div>
              </div>

              {filteredRooms.length === 0 ? (
                <div className="bg-white rounded-md p-8 text-center">
                  <p className="text-gray-500">ไม่มีห้องที่ตรงการค้นหา</p>
                </div>
              ) : (
                sortedFloors.map((floor) => (
                  <div key={floor} className="mb-12">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 flex items-center">
                      ชั้น {floor}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {roomsByFloor[floor].map((room) => (
                        <Card
                          key={room.id}
                          className={`hover:shadow-md transition-all duration-200 cursor-pointer ${
                            room.available === 0 ? "bg-gray-50" : ""
                          }`}
                          onClick={() => handleOpenRoomDetails(room.id)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <Home className="h-5 w-5 text-primary" />
                                <CardTitle>ห้อง {room.roomName}</CardTitle>
                              </div>
                              <Badge
                                variant="outline"
                                className={
                                  room.available === 1
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : "bg-green-50 text-green-700 border-green-200"
                                }
                              >
                                {room.available === 1 ? "ไม่ว่าง" : "ว่าง"}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="text-sm text-gray-500">
                                • Type {room.roomTypeId}
                              </div>
                              <div className="text-sm text-gray-500">
                                • {room.description}
                              </div>
                              {room.renterID ? (
                                <div className="flex items-center gap-2 mt-2">
                                  <User className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium">
                                    {currentTenants[room.id]?.firstname}{" "}
                                    {currentTenants[room.id]?.lastname}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 mt-2 text-gray-500 italic">
                                  <User className="h-4 w-4 text-gray-400" />
                                  <span>ไม่มีผู้เช่า</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenRoomDetails(room.id);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              จัดการ
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      <Footer />

      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedRoomId &&
                `ห้อง ${
                  rooms.find((r) => r.id === selectedRoomId)?.roomName
                } - ${rooms.find((r) => r.id === selectedRoomId)?.description}`}
            </DialogTitle>
            <DialogDescription>จัดการผู้เช่า</DialogDescription>
          </DialogHeader>

          <DialogFooter>
            {rooms.find((r) => r.id === selectedRoomId)?.available === 1 ? (
              <Button variant="destructive" onClick={handleDeleteTenant}>
                <Trash2 className="h-4 w-4 mr-2" /> ลบผู้เช่า
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setNewTenantEmail("");
                  setIsAddTenantDialogOpen(true);
                }}
              >
                เพิ่มผู้เช่า
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Tenant Dialog */}
      <Dialog open={isAddTenantDialogOpen} onOpenChange={setIsAddTenantDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>เพิ่มผู้เช่าใหม่</DialogTitle>
            <DialogDescription>
              ใส่อีเมลของผู้เช่าที่ต้องการเพิ่ม
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Label htmlFor="tenantEmail">อีเมลผู้เช่า</Label>
            <Input
              id="tenantEmail"
              value={newTenantEmail}
              onChange={(e) => setNewTenantEmail(e.target.value)}
              placeholder="เช่น example@email.com"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTenantDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={confirmAddTenant}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบผู้เช่าออกจากห้อง{" "}
              {selectedRoomId &&
                rooms.find((r) => r.id === selectedRoomId)?.roomName}
              ห้องนี้จะถูกเปลี่ยนสถานะเป็น "ว่าง"
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteTenant}>
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTenant}
              className="bg-destructive hover:bg-[#bc3535]"
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TenantsPage;
