"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Home,
  FileText,
  Bell,
  Settings,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

const AdminMain = () => {
  const [stats, setStats] = useState({
    totalRooms: 0,
    totalTenants: 0,
    totalQueues: 0,
    unpaidBills: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const roomsRes = await fetch('http://localhost:3000/main/room/', {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          },
          credentials: 'include',
          });
        if (!roomsRes.ok)
          throw new Error(`Rooms fetch failed: ${roomsRes.status}`);
        const roomsData = await roomsRes.json();
        setStats((prevStats) => ({...prevStats,totalRooms: roomsData.totalRooms,}));

        const tenantsRes = await fetch('http://localhost:3000/main/vacant/', {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          },
          credentials: 'include',
          });
        if (!tenantsRes.ok)
          throw new Error(`Tenants fetch failed: ${tenantsRes.status}`);
        const tenantsData = await tenantsRes.json();
        setStats((prevStats) => ({...prevStats,totalTenants: tenantsData.totalTenants,
        }));

        const queuesRes = await fetch('http://localhost:3000/main/queue/', {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          },
          credentials: 'include',
          });
        if (!queuesRes.ok)
          throw new Error(`Queues fetch failed: ${queuesRes.status}`);
        const queuesData = await queuesRes.json();
        setStats((prevStats) => ({...prevStats,totalQueues: queuesData.totalQueues,}));
        const billsRes = await fetch('http://localhost:3000/main/bill/', {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          },
          credentials: 'include',
          });
        if (!billsRes.ok)
          throw new Error(`Bills fetch failed: ${billsRes.status}`);
        const billsData = await billsRes.json();
        setStats((prevStats) => ({...prevStats, unpaidBills: billsData.unpaidBills,}));
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
    const features = [
    {
      id: 1,
      title: "แก้ไขผู้เช่า",
      description: "ดูและแก้ไขจัดการ การเข้าพัก",
      icon: <Users className="h-8 w-8 text-blue-500" />,
      path: "/admin/tenant",
      color: "bg-blue-50 hover:bg-blue-100",
    },
    {
      id: 2,
      title: "แก้ไขห้องพัก",
      description: "จัดการรายละเอียดหอพัก",
      icon: <Home className="h-8 w-8 text-green-500" />,
      path: "/admin/room",
      color: "bg-green-50 hover:bg-green-100",
    },
    {
      id: 3,
      title: "บันทึกค่าสาธารณูปโภค",
      description: "ดุแลค่าสาธารณูประโภคผู้เข้าพัก",
      icon: <DollarSign className="h-8 w-8 text-purple-500" />,
      path: "/admin/utility ",
      color: "bg-purple-50 hover:bg-purple-100",
    },
    // {
    //   id: 4,
    //   title: "จัดการผู้ใช้งาน",
    //   description: "จัดการรหัสผู้เช่าห้องพัก",
    //   icon: <Settings className="h-8 w-8 text-orange-500" />,
    //   path: "/admin/user",
    //   color: "bg-orange-50 hover:bg-orange-100",
    // },
    {
      id: 5,
      title: "คิวเข้าดูหอพัก",
      description: "จรวจสอบและจัดการคิว",
      icon: <Bell className="h-8 w-8 text-red-500" />,
      path: "/admin/queue",
      color: "bg-red-50 hover:bg-red-100",
    },
    {
      id: 6,
      title: "ดูคิวแม่บ้าน",
      description: "ดูแลความเรียบร้อยของคิวแม่บ้าน",
      icon: <FileText className="h-8 w-8 text-indigo-500" />,
      path: "/admin/cleaning",
      color: "bg-indigo-50 hover:bg-indigo-100",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>เกิดข้อผิดพลาดในการโหลดข้อมูล: {error}</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col ">
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 pt-16 md:pt-6 overflow-auto">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800">แดชบอร์ด</h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      ห้องพักทั้งหมด
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {stats.totalRooms}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Home className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      ผู้เช่าทั้งหมด
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {stats.totalTenants}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      คิวเข้าชมห้องพัก
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {stats.totalQueues}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Bell className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between ">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      บิลที่ยังไม่ได้ตรวจสอบ
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {stats.unpaidBills}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <DollarSign className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>
            {/* Feature Buttons */}
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              เครื่องมือด่วน
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {features.map((feature) => (
                <Link href={feature.path} key={feature.id}>
                  <div
                    className={`p-6 rounded-lg shadow-sm border border-gray-200 ${feature.color} transition-all duration-200 hover:scale-105 h-full`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4">{feature.icon}</div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default AdminMain;