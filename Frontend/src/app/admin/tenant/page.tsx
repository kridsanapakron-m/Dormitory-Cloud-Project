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
   CalendarRange,
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
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import { format } from "date-fns";
 
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
 }
 
 const TenantsPage = () => {
   const [rooms, setRooms] = useState<Room[]>([]);
   const [searchTerm, setSearchTerm] = useState("");
   const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
   const [editingTenant, setEditingTenant] = useState(false);
   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
   const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
   const [tenantDetails, setTenantDetails] = useState<BasicUser | null>(null);
   const [inputTenantId, setInputTenantId] = useState("");
   const [users, setUsers] = useState<BasicUser[]>([]);
   const [currentTenants, setCurrentTenants] = useState<
     Record<string, BasicUser>
   >({});
 
   const fetchData = async (url: string, options: RequestInit = {}) => {
     const response = await fetch(url, {
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
       const data = await fetchData(`http://localhost:3000/rooms`);
       if (Array.isArray(data.rooms)) {
         setRooms(data.rooms);
       } else {
         console.error("Invalid room data:", data);
         alert("Failed to fetch rooms: Invalid data format.");
       }
     } catch (error) {
       console.error("Error fetching rooms:", error);
       alert(
         `เกิดปัญหาระหว่างการดึงข้อมูลห้อง: ${
           error instanceof Error ? error.message : "ไม่ทราบข้อผิดพลาด"
         }`
       );
     }
   };
 
   const fetchUsers = async () => {
     try {
       const data = await fetchData(`http://localhost:3000/auth/users`);
       if (Array.isArray(data)) {
         const basicUsers = data.map((user) => ({
           id: user.id,
           firstname: user.firstname,
           lastname: user.lastname,
           address: user.address,
           telephone: user.telephone,
           email: user.email,
           userimg: user.userimg,
         }));
         setUsers(basicUsers);
       } else {
         console.error("Invalid user data:", data);
         alert("Failed to fetch users: Invalid data format.");
       }
     } catch (error) {
       console.error("Error fetching users:", error);
       alert(
         `เกิดปัญหาระหว่างการดึงข้อมูลผู้ใช้: ${
           error instanceof Error ? error.message : "ไม่ทราบข้อผิดพลาด"
         }`
       );
     }
   };
 
   const fetchUserById = async (userId: string) => {
     try {
       const data = await fetchData(`http://localhost:3000/auth/id/${userId}`, {
         method: "GET",
         credentials: "include",
       });
       data.id = userId;
       setTenantDetails(data);
       return data;
     } catch (error) {
       console.error("Error fetching user by ID:", error);
       alert(
         `Error fetching user: ${
           error instanceof Error ? error.message : "Unknown error"
         }`
       );
       setTenantDetails(null);
       return null;
     }
   };
 
   useEffect(() => {
     fetchRooms();
     fetchUsers();
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
 
   useEffect(() => {
     if (selectedRoomId && !editingTenant) {
       const room = rooms.find((r) => r.id === selectedRoomId);
       if (room && room.renterID) {
         fetchUserById(room.renterID);
       } else {
         setTenantDetails(null);
         setInputTenantId("");
       }
     }
   }, [selectedRoomId, editingTenant, rooms]);
 
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
     setEditingTenant(false);
     setIsUserDialogOpen(true);
   };
 
   const handleEditTenant = () => {
     setEditingTenant(true);
   };
 
   const handleSaveTenantChanges = async () => {
     if (!selectedRoomId) return;
 
     const room = rooms.find((r) => r.id === selectedRoomId);
     if (!room) return;
 
     try {
       let url, method, body;
 
       if (!inputTenantId || inputTenantId === "unassigned") {
         url = `http://localhost:3000/rooms/${room.id}/clear`;
         method = "PUT";
         body = undefined;
       } else {
         url = `http://localhost:3000/rooms/${room.id}/assign`;
         method = "PUT";
         body = JSON.stringify({ userId: inputTenantId });
       }
       await fetchData(url, {
         method,
         headers: {
           "Content-Type": "application/json",
         },
         body,
       });
 
       setRooms((prevRooms) =>
         prevRooms.map((r) =>
           r.id === room.id
             ? {
                 ...r,
                 renterID: inputTenantId === "unassigned" ? null : inputTenantId,
               }
             : r
         )
       );
       if (!inputTenantId || inputTenantId === "unassigned") {
         setTenantDetails(null);
         setCurrentTenants((prev) => {
           const updated = { ...prev };
           delete updated[selectedRoomId];
           return updated;
         });
       } else {
         const fetchedUser = await fetchUserById(inputTenantId);
         if (fetchedUser) {
           setCurrentTenants((prev) => ({
             ...prev,
             [selectedRoomId]: fetchedUser,
           }));
         }
       }
 
       setEditingTenant(false);
       setIsUserDialogOpen(false);
       window.location.reload();
     } catch (error) {
       console.error("Error saving tenant changes:", error);
       alert(
         `ไม่สามารถบันทึกการเปลี่ยนแปลงเนื่องจาก: ${
           error instanceof Error ? error.message : "ไม่ทราบข้อผิดพลาด"
         }`
       );
     }
   };
 
   const handleDeleteTenant = () => {
     setIsDeleteDialogOpen(true);
   };
 
   const confirmDeleteTenant = async () => {
     if (!selectedRoomId) return;
     const room = rooms.find((r) => r.id === selectedRoomId);
     if (!room) return;
 
     try {
       await fetchData(`http://localhost:3000/rooms/${room.id}/clear`, {
         method: "PUT",
       });
 
       setRooms((prevRooms) =>
         prevRooms.map((r) => (r.id === room.id ? { ...r, renterID: null } : r))
       );
       setTenantDetails(null);
       setCurrentTenants((prev) => {
         const updated = { ...prev };
         delete updated[selectedRoomId];
         return updated;
       });
 
       setIsDeleteDialogOpen(false);
       setIsUserDialogOpen(false);
       window.location.reload();
     } catch (error) {
       console.error("Error deleting tenant:", error);
       alert(
         `ไม่สามารถลบผู้เช่าเนื่องจาก: ${
           error instanceof Error ? error.message : "ไม่ทราบข้อผิดพลาด"
         }`
       );
     }
   };
 
   const cancelDeleteTenant = () => {
     setIsDeleteDialogOpen(false);
   };
 
   const handleTenantIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     setInputTenantId(e.target.value);
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
                   แก้ไขข้อมูลผู้เช่า
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
                             room.renterID ? "" : "bg-gray-50"
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
                                 className={`${
                                   room.renterID
                                     ? "bg-green-50 text-green-700 border-green-200"
                                     : "bg-gray-50 text-gray-700 border-gray-200"
                                 }`}
                               >
                                 {room.renterID ? "ไม่ว่าง" : "ว่าง"}
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
                               แก้ไข
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
             <DialogDescription>
               {editingTenant ? "แก้ไขข้อมูลผู้เช่า" : "รายละเอียดของผู้เช่า"}
             </DialogDescription>
           </DialogHeader>
           <div className="space-y-4 py-2">
             {selectedRoomId &&
               !rooms.find((r) => r.id === selectedRoomId)?.renterID &&
               !editingTenant && (
                 <div className="rounded-md bg-gray-50 p-4 flex items-center gap-3">
                   <Home className="h-5 w-5 text-gray-500" />
                   <div>
                     <p className="font-medium text-gray-800">ห้องนี้ว่าง</p>
                     <p className="text-sm text-gray-600">
                       สามารถเพิ่มผู้เช่าได้ด้วยการกดปุ่ม "แก้ไขผู้เช่า"
                       ข้างล่างนี้
                     </p>
                   </div>
                 </div>
               )}
 
             {editingTenant && (
               <div className="space-y-4">
                 <div className="space-y-2">
                   <Label htmlFor="userSelect">เลือกผู้ใช้</Label>
                   <Select
                     value={inputTenantId}
                     onValueChange={setInputTenantId}
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="-- เลือกผู้ใช้ --" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="unassigned">
                         -- ไม่มีผู้เช่า (ว่าง) --
                       </SelectItem>
                       {users.map((user) => (
                         <SelectItem key={user.id} value={user.id.toString()}>
                           {user.firstname} {user.lastname} ({user.id})
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
 
                 <div className="relative flex items-center my-4">
                   <div className="flex-grow border-t border-gray-300"></div>
                   <span className="flex-shrink mx-4 text-gray-400 text-sm">
                     OR
                   </span>
                   <div className="flex-grow border-t border-gray-300"></div>
                 </div>
 
                 <div className="space-y-2">
                   <Label htmlFor="userId">ใส่ข้อมูลผู้เช่าโดยตรง</Label>
                   <Input
                     id="userId"
                     value={inputTenantId}
                     onChange={handleTenantIdChange}
                     placeholder="ใส่ไอดีผู้ใช้ (ปล่อยว่างถ้าไม่มีผู้เช่า)"
                   />
                   <div className="flex items-start gap-2 mt-1.5">
                     <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                     <p className="text-xs text-gray-500">
                       กรอกไอดีของผู้เช่า (เช่น U001) เพื่อระบุผู้เช่า,
                       หรือปล่อยว่างไว้ถ้าไม่มีผู้เช่า
                     </p>
                   </div>
                 </div>
               </div>
             )}
 
             {!editingTenant && tenantDetails && (
               <div className="space-y-4">
                 <div className="rounded-md bg-blue-50 p-4 flex items-center gap-3">
                   <User className="h-5 w-5 text-blue-500" />
                   <div>
                     <p className="font-medium text-blue-800">
                       {tenantDetails.firstname} {tenantDetails.lastname}
                     </p>
                     <p className="text-sm text-blue-700">
                       ID: {tenantDetails.id}
                     </p>
                   </div>
                 </div>
                 {tenantDetails.address && (
                   <div className="flex items-center gap-2">
                     <Home className="h-4 w-4 text-gray-600" />
                     <p className="text-sm text-gray-600">
                       {tenantDetails.address}
                     </p>
                   </div>
                 )}
                 {tenantDetails.telephone && (
                   <div className="flex items-center gap-2">
                     <Phone className="h-4 w-4 text-gray-600" />
                     <p className="text-sm text-gray-600">
                       {tenantDetails.telephone}
                     </p>
                   </div>
                 )}
                 {tenantDetails.email && (
                   <div className="flex items-center gap-2">
                     <Mail className="h-4 w-4 text-gray-600" />
                     <p className="text-sm text-gray-600">
                       {tenantDetails.email}
                     </p>
                   </div>
                 )}
                 {tenantDetails.userimg && (
                   <div className="flex items-center gap-2">
                     <User className="h-4 w-4 text-gray-600" />
                     <img
                       src={tenantDetails.userimg}
                       alt="User"
                       className="h-10 w-10 rounded-full"
                     />
                   </div>
                 )}
               </div>
             )}
           </div>
 
           <DialogFooter>
             {editingTenant ? (
               <>
                 <Button
                   variant="outline"
                   onClick={() => setEditingTenant(false)}
                 >
                   ยกเลิก
                 </Button>
                 <Button onClick={handleSaveTenantChanges}>
                   บันทึกการเปลี่ยนแปลง
                 </Button>
               </>
             ) : (
               <>
                 {rooms.find((r) => r.id === selectedRoomId)?.renterID && (
                   <Button variant="destructive" onClick={handleDeleteTenant}>
                     <Trash2 className="h-4 w-4 mr-2" /> ลบผู้เช่า
                   </Button>
                 )}
                 <Button onClick={handleEditTenant}>แก้ไขผู้เช่า</Button>
               </>
             )}
           </DialogFooter>
         </DialogContent>
       </Dialog>
 
       <AlertDialog
         open={isDeleteDialogOpen}
         onOpenChange={setIsDeleteDialogOpen}
       >
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
             <AlertDialogDescription>
               คุณแน่ใจหรือไม่ว่าต้องการลบผู้เช่ารายนี้ออกจากห้อง{" "}
               {selectedRoomId &&
                 rooms.find((r) => r.id === selectedRoomId)?.roomName}
               ห้องนี้จะถูกเปลี่ยนสถานะเป็น "ไม่มีผู้เช่า"
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel onClick={cancelDeleteTenant}>
               ยกเลิก
             </AlertDialogCancel>
             <AlertDialogAction onClick={confirmDeleteTenant} className="bg-destructive hover:bg-[#bc3535]">
               ลบ
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>
     </div>
   );
 };

 export default TenantsPage;