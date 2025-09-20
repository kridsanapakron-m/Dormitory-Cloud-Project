"use client"

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search,
  Edit,
  Trash2,
  UserPlus,
  X,
  Check
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

// User type definition
type UserType = {
  id: number;
  studentId: string;
  name: string;
  roomType: string;
  roomNumber: string;
  phone: string;
  email: string;
};

// Sample user data
const sampleUsers: UserType[] = [
  {
    id: 1,
    studentId: '66070055',
    name: 'ณฐกร หอมพันนา',
    roomType: 'Type A',
    roomNumber: '401',
    phone: '062-123-4567',
    email: '66070055@kmitl.ac.th'
  },
  {
    id: 2,
    studentId: '66070220',
    name: 'อรุชา เขมทโรนนท์',
    roomType: 'Type B',
    roomNumber: '302',
    phone: '099-876-5432',
    email: '66070220@kmitl.ac.th'
  },
  {
    id: 3,
    studentId: '66070006',
    name: 'กฤษณปกรณ์ เมรัตรัน์',
    roomType: 'Type A',
    roomNumber: '503',
    phone: '081-234-5678',
    email: '66070006@kmitl.ac.th'
  },
  {
    id: 4,
    studentId: '66070245',
    name: 'คณิตพัฒน์ เตชะอัครเศรษฐ์',
    roomType: 'Type C',
    roomNumber: '205',
    phone: '086-987-6543',
    email: '66070245@kmitl.ac.th'
  },
];

// Room type options
const roomTypes = ["Type A", "Type B", "Type C", "ปรับอากาศหญิงล้วน", "ไม่ปรับอากาศชายล้วน", "ไม่ปรับอากาศชาย-หญิง"];

const UserManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [users, setUsers] = useState<UserType[]>(sampleUsers);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [editFormData, setEditFormData] = useState<UserType | null>(null);
  const [newUserData, setNewUserData] = useState<Omit<UserType, 'id'>>({
    studentId: '',
    name: '',
    roomType: roomTypes[0],
    roomNumber: '',
    phone: '',
    email: ''
  });

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle edit button click
  const handleEditClick = (user: UserType) => {
    setSelectedUser(user);
    setEditFormData({...user});
    setIsEditDialogOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (user: UserType) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editFormData) {
      setEditFormData({
        ...editFormData,
        [name]: value
      });
    }
  };

  // Submit edit form
  const handleEditSubmit = () => {
    if (editFormData) {
      setUsers(users.map(user => 
        user.id === editFormData.id ? editFormData : user
      ));
      setIsEditDialogOpen(false);
    }
  };

  // Confirm delete
  const handleDeleteConfirm = () => {
    if (selectedUser) {
      setUsers(users.filter(user => user.id !== selectedUser.id));
      setIsDeleteDialogOpen(false);
    }
  };
  
  // Handle new user form input changes
  const handleNewUserInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUserData({
      ...newUserData,
      [name]: value
    });
  };
  
  // Handle add new user
  const handleAddUser = () => {
    const newUser: UserType = {
      id: Math.max(...users.map(user => user.id)) + 1, // Generate a new ID
      ...newUserData
    };
    
    setUsers([...users, newUser]);
    setIsAddDialogOpen(false);
    
    // Reset form data
    setNewUserData({
      studentId: '',
      name: '',
      roomType: roomTypes[0],
      roomNumber: '',
      phone: '',
      email: ''
    });
  };

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col overflow-auto'>
      <div className='flex flex-1'>
        <Sidebar />
        
        <main className='h-screen flex-1 overflow-auto'>
          <div className="p-6 pt-16 md:pt-6 min-h-screen">
            <div className="container mx-auto">
              <div className='flex flex-col md:flex-row md:items-center justify-between mb-6'>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-0">จัดการผู้เช่า</h1>
                <div className='flex gap-3'>
                  <div className='relative w-full md:w-64'>
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="text"
                      placeholder='ค้นหาผู้เช่า...'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className='pl-9 w-full'
                    />
                  </div>
                  <Button 
                    className="flex items-center gap-2"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    <UserPlus className="h-4 w-4" />
                    เพิ่มผู้เช่า
                  </Button>
                </div>
              </div>
              
              {/* User Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          รหัสนักศึกษา
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ชื่อ-นามสกุล
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ประเภทห้อง
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          เลขห้อง
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          จัดการ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.studentId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.roomType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.roomNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            <div className="flex justify-center space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                onClick={() => handleEditClick(user)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                แก้ไข
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteClick(user)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                ลบ
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredUsers.length === 0 && (
                  <div className="py-8 text-center text-gray-500">
                    ไม่พบข้อมูลผู้เช่า
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <Footer />
        </main>
      </div>

      {/* Edit User Dialog */}
      {editFormData && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>แก้ไขข้อมูลผู้เช่า</DialogTitle>
              <DialogDescription>
                แก้ไขข้อมูลผู้เช่าตามที่ต้องการ แล้วกดยืนยันเพื่อบันทึกข้อมูล
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="studentId" className="text-right">
                  รหัสนักศึกษา
                </Label>
                <Input
                  id="studentId"
                  name="studentId"
                  value={editFormData.studentId}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  ชื่อ-นามสกุล
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={editFormData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="roomType" className="text-right">
                  ประเภทห้อง
                </Label>
                <select
                  id="roomType"
                  name="roomType"
                  value={editFormData.roomType}
                  onChange={handleInputChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {roomTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="roomNumber" className="text-right">
                  เลขห้อง
                </Label>
                <Input
                  id="roomNumber"
                  name="roomNumber"
                  value={editFormData.roomNumber}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  เบอร์โทรศัพท์
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  อีเมล
                </Label>
                <Input
                  id="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            
            <DialogFooter className="sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
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
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบข้อมูลผู้เช่า</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลผู้เช่า {selectedUser?.name} เมื่อลบแล้วจะไม่สามารถกู้คืนข้อมูลได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              ยืนยันการลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Add New User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>เพิ่มผู้เช่าใหม่</DialogTitle>
            <DialogDescription>
              กรอกข้อมูลผู้เช่าใหม่ให้ครบถ้วน แล้วกดยืนยันเพื่อบันทึกข้อมูล
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newStudentId" className="text-right">
                รหัสนักศึกษา
              </Label>
              <Input
                id="newStudentId"
                name="studentId"
                value={newUserData.studentId}
                onChange={handleNewUserInputChange}
                className="col-span-3"
                placeholder="66XXXXXXX"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newName" className="text-right">
                ชื่อ-นามสกุล
              </Label>
              <Input
                id="newName"
                name="name"
                value={newUserData.name}
                onChange={handleNewUserInputChange}
                className="col-span-3"
                placeholder="ชื่อ นามสกุล"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newRoomType" className="text-right">
                ประเภทห้อง
              </Label>
              <select
                id="newRoomType"
                name="roomType"
                value={newUserData.roomType}
                onChange={handleNewUserInputChange}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {roomTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newRoomNumber" className="text-right">
                เลขห้อง
              </Label>
              <Input
                id="newRoomNumber"
                name="roomNumber"
                value={newUserData.roomNumber}
                onChange={handleNewUserInputChange}
                className="col-span-3"
                placeholder="เช่น 401"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newPhone" className="text-right">
                เบอร์โทรศัพท์
              </Label>
              <Input
                id="newPhone"
                name="phone"
                value={newUserData.phone}
                onChange={handleNewUserInputChange}
                className="col-span-3"
                placeholder="0XX-XXX-XXXX"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newEmail" className="text-right">
                อีเมล
              </Label>
              <Input
                id="newEmail"
                name="email"
                value={newUserData.email}
                onChange={handleNewUserInputChange}
                className="col-span-3"
                placeholder="example@email.com"
              />
            </div>
          </div>
          
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
            >
              <X className="mr-2 h-4 w-4" />
              ยกเลิก
            </Button>
            <Button
              type="button"
              onClick={handleAddUser}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="mr-2 h-4 w-4" />
              เพิ่มผู้เช่า
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementPage;