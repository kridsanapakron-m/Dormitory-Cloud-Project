"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Edit,
  Trash2,
  X,
  Check,
  ImagePlus,
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

type RoomType = {
  id: number;
  roomName: string;
  roomTypeId: string;
  floor: number;
  occupied: boolean;
  description: string;
  roomImg: string;
  renterID: string | null;
};

type RoomTypeOption = {
  id: string;
  name: string;
};

const RoomManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newRoomData, setNewRoomData] = useState<Partial<RoomType>>({
    roomName: "",
    roomTypeId: "A",
    floor: 1,
    occupied: false,
    description: "",
    roomImg: "",
    renterID: null,
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [editFormData, setEditFormData] = useState<RoomType | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [addRoomError, setAddRoomError] = useState<string | null>(null);
  const [editRoomError, setEditRoomError] = useState<string | null>(null);
  const [originalRoomImg, setOriginalRoomImg] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [roomTypeOptions, setRoomTypeOptions] = useState<RoomTypeOption[]>([]);

  const router = useRouter();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await apiFetch("/rooms/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch rooms: ${response.status}`);
        }

        const data = await response.json();
        const mappedRooms: RoomType[] = data.rooms.map((room: any) => ({
          id: room.id,
          roomName: room.roomName,
          roomTypeId: room.roomTypeId,
          floor: room.floor,
          occupied: room.available === 1, //sda
          description: room.description,
          roomImg: room.roomImg,
          renterID: room.renterID,
        }));

        setRooms(mappedRooms);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    fetchRooms();
  }, []);

  // fetch roomType options
  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const res = await apiFetch("/roomtype", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch room types");

        const data = await res.json();

        const mapped = data.map((rt: any) => ({
          id: rt.roomtypeid,
          name: rt.name,
        }));

        setRoomTypeOptions(mapped);
      } catch (err) {
        console.error("Error fetching room types:", err);
      }
    };

    fetchRoomTypes();
  }, []);

  const filteredRooms = rooms.filter(
    (room) =>
      room.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roomTypeOptions
        .find((type) => type.id === room.roomTypeId)
        ?.name.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (room: RoomType) => {
    setSelectedRoom(room);
    setEditFormData({ ...room });
    setImagePreview(room.roomImg);
    setOriginalRoomImg(room.roomImg);
    setIsEditDialogOpen(true);
    setEditRoomError(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    if (editFormData) {
      const updatedValue = name === "floor" ? parseInt(value, 10) : value;
      setEditFormData({
        ...editFormData,
        [name]: updatedValue,
      });
    }
  };

  const handleNewRoomInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    const updatedValue = name === "floor" ? parseInt(value, 10) : value;
    console.log(updatedValue);
    setNewRoomData((prev) => ({ ...prev, [name]: updatedValue }));
    setAddRoomError(null);
  };

  const handleNewRoomImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageChange(e);
  };

  const validateNewRoomData = () => {
    if (!newRoomData.roomName) {
      setAddRoomError("กรุณากรอกชื่อห้อง");
      return false;
    }
    if (!newRoomData.roomTypeId) {
      setAddRoomError("กรุณาเลือกประเภทห้อง");
      return false;
    }
    if (!newRoomData.floor) {
      setAddRoomError("กรุณากรอกชั้น");
      return false;
    }
    if (!newRoomData.description) {
      setAddRoomError("กรุณากรอกรายละเอียดห้อง");
      return false;
    }
    if (!newRoomData.roomImg) {
      setAddRoomError("กรุณาใส่รูปภาพ");
      return;
    }
    if (rooms.some((room) => room.roomName === newRoomData.roomName)) {
      setAddRoomError("ชื่อห้องนี้มีอยู่แล้ว");
      return false;
    }
    return true;
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      const newPreviewUrl = URL.createObjectURL(file);
      setImagePreview(newPreviewUrl);
      try {
        const base64String = await fileToBase64(file);

        if (editFormData) {
          setEditFormData((prev) => {
            if (prev) {
              return {
                ...prev,
                roomImg: base64String,
              };
            }
            return null;
          });
        }
        if (newRoomData) {
          setNewRoomData((prev) => ({
            ...prev,
            roomImg: base64String,
          }));
        }
      } catch (error) {
        console.error("Error converting image to base64:", error);
        setEditRoomError("Failed to process image.");
      }
    }
  };

  const handleAddRoomSubmit = async () => {
    if (!validateNewRoomData()) return;

    const requestData = {
      roomName: newRoomData.roomName ?? "",
      roomTypeId: newRoomData.roomTypeId?.toString() ?? "",
      floor: newRoomData.floor?.toString() ?? "",
      description: newRoomData.description ?? "",
      roomImg: newRoomData.roomImg || "",
      userId: newRoomData.renterID || "",
    };
    console.log(requestData);

    try {
      const response = await apiFetch("/rooms/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setAddRoomError(`Failed to add room: ${errorData.message}`);
        throw new Error(
          `Failed to add room: ${response.status} - ${errorData.message}`
        );
      }

      const data = await response.json();
      const refetchResponse = await apiFetch("/rooms/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!refetchResponse.ok) {
        throw new Error(`Failed to refetch rooms: ${refetchResponse.status}`);
      }

      const refetchData = await refetchResponse.json();
      const mappedRooms: RoomType[] = refetchData.rooms.map((room: any) => ({
        id: room.id,
        roomName: room.roomName,
        roomTypeId: room.roomTypeId,
        floor: room.floor,
        occupied: room.available === 1,
        description: room.description,
        roomImg: room.roomImg,
        renterID: room.renterID,
      }));

      setRooms(mappedRooms);
      setIsAddDialogOpen(false);
      setNewRoomData({
        roomName: "",
        roomTypeId: "A",
        floor: 1,
        occupied: true,
        description: "",
        roomImg: "",
        renterID: null,
      });
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Error adding room:", error);
      setAddRoomError("Failed to add room.  Check console for details.");
    }
  };

  const validateEditRoomData = () => {
    if (!editFormData?.roomName) {
      setEditRoomError("กรุณากรอกชื่อห้อง");
      return false;
    }
    if (!editFormData?.roomTypeId) {
      console.log(editFormData?.roomTypeId);
      setEditRoomError("กรุณาเลือกประเภทห้อง");
      return false;
    }

    if (!editFormData?.floor) {
      setEditRoomError("กรุณากรอกชั้น");
      return false;
    }

    if (!editFormData?.description) {
      setEditRoomError("กรุณากรอกรายละเอียด");
      return false;
    }
    if (!editFormData.roomImg) {
      setEditRoomError("กรุณาใส่รูปภาพ");
      return;
    }

    if (
      rooms.some(
        (room) =>
          room.roomName === editFormData.roomName && room.id !== editFormData.id
      )
    ) {
      setEditRoomError("ชื่อห้องนี้มีอยู่แล้ว");
      return false;
    }
    return true;
  };

  const handleEditSubmit = async () => {
    console.log("roomtype here" + editFormData?.roomTypeId);
    if (!editFormData || !validateEditRoomData()) return;
    console.log("เลขห้อง:", editFormData.roomName);
    console.log("ชั้น:", editFormData.floor);
    console.log(
      "ประเภทห้อง:",
      roomTypeOptions.find((type) => type.id === editFormData.roomTypeId)?.name
    );
    console.log("รายละเอียด:", editFormData.description);
    const requestData = {
      roomName: editFormData.roomName,
      roomTypeId: editFormData.roomTypeId.toString(),
      floor: editFormData.floor.toString(),
      description: editFormData.description,
      roomImg: editFormData.roomImg,
      renterID: editFormData.renterID || "",
    };
    console.log(requestData);

    try {
      const response = await apiFetch(
        `/rooms/${editFormData.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setEditRoomError(`Failed to update room: ${errorData.message}`);
        throw new Error(
          `Failed to update room: ${response.status} - ${errorData.message}`
        );
      }
      const refetchResponse = await apiFetch("/rooms/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!refetchResponse.ok) {
        throw new Error(`Failed to refetch rooms: ${refetchResponse.status}`);
      }

      const refetchData = await refetchResponse.json();
      const mappedRooms: RoomType[] = refetchData.rooms.map((room: any) => ({
        id: room.id,
        roomName: room.roomName,
        roomTypeId: room.roomTypeId,
        floor: room.floor,
        occupied: room.available === 1,
        description: room.description,
        roomImg: room.roomImg,
        renterID: room.renterID,
      }));

      setRooms(mappedRooms);
      setIsEditDialogOpen(false);
      if (imagePreview && imagePreview !== originalRoomImg) {
        URL.revokeObjectURL(imagePreview);
      }
      setImageFile(null);
      setImagePreview(null);
      setEditFormData(null);
    } catch (error) {
      console.error("Error updating room:", error);
      setEditRoomError("Failed to update room. Check console for details.");
    }
  };
  const handleDeleteRoom = async () => {
    if (!editFormData) return;

    try {
      const response = await apiFetch(
        `/rooms/${editFormData.id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setEditRoomError(`Failed to delete room: ${errorData.message}`);
        throw new Error(
          `Failed to delete room: ${response.status} - ${errorData.message}`
        );
      }
      const refetchResponse = await apiFetch("/rooms/", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!refetchResponse.ok) {
        throw new Error(`Failed to refetch rooms: ${refetchResponse.status}`);
      }

      const refetchData = await refetchResponse.json();
      const mappedRooms: RoomType[] = refetchData.rooms.map((room: any) => ({
        id: room.id,
        roomName: room.roomName,
        roomTypeId: room.roomTypeId,
        floor: room.floor,
        occupied: room.available === 1,
        description: room.description,
        roomImg: room.roomImg,
        renterID: room.renterID,
      }));
      setRooms(mappedRooms);

      setIsEditDialogOpen(false);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImageFile(null);
      setImagePreview(null);
      setEditFormData(null);
      setDeleteConfirmation(false);
    } catch (error) {
      toast.error("ไม่สามารถลบห้องได้ เนื่องจากมีผู้เช่าอยู่");
      setDeleteConfirmation(false);
      setEditRoomError("Failed to delete room. Check console for details.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-auto">
      <div className="flex flex-1">
        <Sidebar />

        <main className="h-screen flex-1 overflow-auto">
          <div className="p-6 pt-16 md:pt-6">
            <div className="container mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-0">
                  จัดการห้องพัก
                </h1>
                <div className="flex space-x-4">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="text"
                      placeholder="ค้นหาห้องพัก..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-full"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    เพิ่มห้องพัก
                  </Button>
                </div>
              </div>

              {/* Room Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRooms.map((room) => (
                  <Card
                    key={room.id}
                    className="overflow-hidden hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="relative w-full h-48">
                      <Image
                        src={room.roomImg}
                        alt={`Room ${room.roomName}`}
                        className="object-cover"
                        fill
                      />
                      <Badge
                        className={`absolute top-2 right-2 ${room.occupied
                            ? "bg-red-100 text-red-800 border-red-200"
                            : "bg-green-100 text-green-800 border-green-200"
                          }`}
                      >
                        {room.occupied ? "ไม่ว่าง" : "ว่าง"}
                      </Badge>
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-xl">
                          ห้อง {room.roomName}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {
                            roomTypeOptions.find(
                              (type) => type.id === room.roomTypeId
                            )?.name
                          }
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2 mt-1">
                        {room.description}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-0">
                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={() => handleEditClick(room)}
                      >
                        <Edit className="h-4 w-4" />
                        แก้ไขข้อมูลห้อง
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {filteredRooms.length === 0 && (
                <div className="bg-white rounded-lg shadow p-8 text-center mt-6">
                  <p className="text-gray-500">ไม่พบข้อมูลห้องพัก</p>
                </div>
              )}
            </div>
          </div>

          <Footer />
        </main>
      </div>

      {/* Edit Room Dialog */}
      {editFormData && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>แก้ไขข้อมูลห้องพัก</DialogTitle>
              <DialogDescription>
                แก้ไขข้อมูลห้องพักและอัพโหลดรูปภาพห้องพัก
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {editRoomError && (
                <div className="text-red-500 text-sm">{editRoomError}</div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="roomName" className="text-right">
                  เลขห้อง
                </Label>
                <Input
                  id="roomName"
                  name="roomName"
                  value={editFormData.roomName}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="floor" className="text-right">
                  ชั้น
                </Label>
                <Input
                  id="floor"
                  name="floor"
                  type="number"
                  value={editFormData.floor}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="roomTypeId" className="text-right">
                  ประเภทห้อง
                </Label>
                <select
                  id="roomTypeId"
                  name="roomTypeId"
                  value={editFormData.roomTypeId}
                  onChange={handleInputChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {roomTypeOptions.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  รายละเอียด
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={editFormData.description}
                  onChange={handleInputChange}
                  className="col-span-3 min-h-[100px]"
                  placeholder="รายละเอียดห้องพัก"
                />
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="roomImage" className="text-right pt-2">
                  รูปภาพห้องพัก
                </Label>
                <div className="col-span-3 space-y-3">
                  {imagePreview && (
                    <div className="relative w-full h-48 rounded-md overflow-hidden border border-gray-200">
                      <Image
                        src={imagePreview}
                        alt="Room preview"
                        className="object-cover"
                        fill
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Input
                      id="roomImage"
                      type="file"
                      accept="image/*"
                      name="roomImg"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Label
                      htmlFor="roomImage"
                      className="flex cursor-pointer items-center gap-2 rounded-md bg-primary/10 px-4 py-2 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <ImagePlus className="h-4 w-4" />
                      เลือกรูปภาพ
                    </Label>
                    {imageFile && (
                      <span className="text-sm text-gray-500 truncate max-w-[180px]">
                        {imageFile.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  if (imagePreview && imagePreview !== originalRoomImg) {
                    URL.revokeObjectURL(imagePreview);
                  }
                  setImageFile(null);
                  setImagePreview(null);
                }}
              >
                <X className="mr-2 h-4 w-4" />
                ยกเลิก
              </Button>
              <Button
                type="button"
                onClick={handleEditSubmit}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="mr-2 h-4 w-4" />
                บันทึกข้อมูล
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setDeleteConfirmation(true)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                ลบห้องพัก
              </Button>
            </DialogFooter>
            {/* Delete Confirmation Dialog */}
            {deleteConfirmation && (
              <Dialog
                open={deleteConfirmation}
                onOpenChange={setDeleteConfirmation}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>ยืนยันการลบห้องพัก</DialogTitle>
                    <DialogDescription>
                      คุณแน่ใจหรือไม่ว่าต้องการลบห้องพักนี้?
                      การดำเนินการนี้ไม่สามารถย้อนกลับได้
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDeleteConfirmation(false)}
                    >
                      ยกเลิก
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteRoom}>
                      ยืนยันการลบ
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>เพิ่มห้องพัก</DialogTitle>
            <DialogDescription>
              เพิ่มข้อมูลห้องพักและอัพโหลดรูปภาพห้องพัก
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {addRoomError && (
              <div className="text-red-500 text-sm">{addRoomError}</div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="roomName" className="text-right">
                เลขห้อง
              </Label>
              <Input
                id="roomName"
                name="roomName"
                value={newRoomData.roomName}
                onChange={handleNewRoomInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="floor" className="text-right">
                ชั้น
              </Label>
              <Input
                id="floor"
                name="floor"
                type="number"
                value={newRoomData.floor}
                onChange={handleNewRoomInputChange}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="roomTypeId" className="text-right">
                ประเภทห้อง
              </Label>
              <select
                id="roomTypeId"
                name="roomTypeId"
                value={newRoomData.roomTypeId}
                onChange={handleNewRoomInputChange}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {roomTypeOptions.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                รายละเอียด
              </Label>
              <Textarea
                id="description"
                name="description"
                value={newRoomData.description}
                onChange={handleNewRoomInputChange}
                className="col-span-3 min-h-[100px]"
                placeholder="รายละเอียดห้องพัก"
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="roomImage" className="text-right pt-2">
                รูปภาพห้องพัก
              </Label>
              <div className="col-span-3 space-y-3">
                {imagePreview && (
                  <div className="relative w-full h-48 rounded-md overflow-hidden border border-gray-200">
                    <Image
                      src={imagePreview!}
                      alt="Room preview"
                      className="object-cover"
                      fill
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    id="roomImage"
                    type="file"
                    accept="image/*"
                    onChange={handleNewRoomImageChange}
                    className="hidden"
                  />
                  <Label
                    htmlFor="roomImage"
                    className="flex cursor-pointer items-center gap-2 rounded-md bg-primary/10 px-4 py-2 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <ImagePlus className="h-4 w-4" />
                    เลือกรูปภาพ
                  </Label>
                  {imageFile && (
                    <span className="text-sm text-gray-500 truncate max-w-[180px]">
                      {imageFile.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                if (imagePreview) {
                  URL.revokeObjectURL(imagePreview);
                }
                setImageFile(null);
                setImagePreview(null);
                setAddRoomError(null);
              }}
            >
              <X className="mr-2 h-4 w-4" />
              ยกเลิก
            </Button>
            <Button
              type="button"
              onClick={handleAddRoomSubmit}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Check className="mr-2 h-4 w-4" />
              เพิ่มห้องพัก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomManagementPage;
