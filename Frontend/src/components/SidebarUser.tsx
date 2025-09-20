"use client";

import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Clock,
  CreditCard,
  Users2,
  LogOut,
  HelpCircle,
  Menu,
  PhoneCall,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import { toast } from 'sonner';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const SidebarUser = ({ className }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const menuItems = [
    {
      title: "หน้าหลัก",
      icon: Home,
      href: "/user/main"
    },
    {
      title: "จ่ายค่าเช่า",
      icon: CreditCard,
      href: "/user/bill"
    },
    {
      title: "ใช้บริการแม่บ้าน",
      icon: PhoneCall,
      href: "/user/service"
    },
    {
      title: "ประวัติการทำธุรกรรม",
      icon: Clock,
      href: "/user/transaction",
    },
    {
      title: "บอร์ดสนทนา",
      icon: Users2,
      href: "/user/chat"
    },
  ];

  const isActive = (href: string) => {
    if (!isClient) return false;
    if (href === '/dashboard' && pathname === '/') return true;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsMobileMenuOpen(false);
  };

  const handleSubmenuToggle = (title: string) => {
    setOpenSubmenu(openSubmenu === title ? null : title);
  };


  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:3000/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        window.location.href = "/";
      } else {
        const errorData = await response.json();
        console.error('Logout failed:', errorData);
        toast.error(`เข้าสู่ระบบไม่สำเร็จเนื่องจาก: ${errorData.message || 'ไม่ทราบสาเหตุ'}`);

      }
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('เข้าสู่ระบบไม่สำเร็จเนื่องจาก:  ข้อผิดพลาดของเครือข่าย');
    }
  };


  const SidebarContent = () => (
    <div className="space-y-4 py-4 h-full flex flex-col justify-between">
      <div className="px-3 py-2">
        <div className="flex flex-col items-start px-3 my-8">
          <h2 className="text-3xl font-semibold text-primary leading-[10px]">Dormitory</h2>
          <h2 className="text-3xl font-semibold leading-[40px]">Manager</h2>
        </div>
        <div className="space-y-2">
          {menuItems.map((item) => (
            <div key={item.title} className="transition-all duration-200">
              <Button
                variant={isActive(item.href) ? "primary" : "ghost"}
                className="w-full justify-start text-[18px] py-6 transition-all duration-200"
                onClick={() => {
                  handleNavigation(item.href);
                }}
              >
                <item.icon className="mr-2 h-7 w-7 md:h-10 md:w-10" />
                <span className="truncate">{item.title}</span>
              </Button>
            </div>
          ))}
        </div>
      </div>
      <div className="px-3 w-full mt-auto">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-[18px] py-6 transition-colors duration-200 hover:bg-red-500 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-6 w-6 md:h-8 md:w-8" />
            ออกจากระบบ
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-[18px] py-6 transition-colors duration-200"
            onClick={() => handleNavigation('/help')}
          >
            <HelpCircle className="mr-2 h-6 w-6 md:h-8 md:w-8" />
            ช่วยเหลือ & สนับสนุน
          </Button>
        </div>
      </div>
    </div>
  );

  const MobileMenuButton = () => (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72">
        <SheetHeader className="sr-only">
          <SheetTitle>เมนู</SheetTitle>
          <SheetDescription>เมนูสำหรับระบบจัดการหอพัก</SheetDescription>
        </SheetHeader>
        <SidebarContent />
      </SheetContent>
    </Sheet>
  );

  return (
    <>
      <MobileMenuButton />

      <div className={cn("hidden md:block relative min-h-screen w-72 bg-background border-r pb-12", className)}>
        <div className='h-screen flex flex-col justify-between pb-4 overflow-y-auto'>
          <SidebarContent />
        </div>
      </div>
    </>
  );
};

export default SidebarUser;