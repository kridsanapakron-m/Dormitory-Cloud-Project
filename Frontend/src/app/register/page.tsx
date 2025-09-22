"use client"

import React, { FormEvent, useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RegisterFormData } from '@/components/types';
import { VALIDATION_MESSAGES } from '@/components/data';
import { toast } from "sonner"
import { apiFetch } from "@/lib/api";

const Register = () => {
  const [showPassword, setShowPassword] =  useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =  useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const submitRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      
      const userData: RegisterFormData = {
        username: formData.get('username') as string,
        email: formData.get('email') as string, 
        password: formData.get('password') as string,
        confirmedPassword: formData.get('confirmedPassword') as string,
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        dateOfBirth: formData.get('dateOfBirth') as string,
        address: formData.get('address') as string,
        telephone: formData.get('telephone') as string,
      };

      const termsAccepted = (form.elements.namedItem('terms') as HTMLInputElement).checked;

      if (userData.password !== userData.confirmedPassword) {
        throw new Error('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      }

      if (userData.password.length < 8) {
        throw new Error('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      }

      if (!termsAccepted) {
        throw new Error('กรุณายอมรับข้อกำหนดการใช้บริการและความเป็นส่วนตัว');
      }

      const phoneRegex = /^0[0-9]{9}$/;
      if (!phoneRegex.test(userData.telephone)) {
        throw new Error('กรุณากรอกหมายเลขโทรศัพท์ให้ถูกต้อง (เช่น 0812345678)');
      }

      const response = await apiFetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          dateOfBirth: userData.dateOfBirth,
          address: userData.address,
          telephone: userData.telephone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'การลงทะเบียนไม่สำเร็จ');
      }

      toast.success("เข้าสู่ระบบสำเร็จ", {
        duration: 3000,
        position: 'bottom-right',
      });

      router.push('/login')
    } catch (error) {
      const errorMessage = error instanceof Error && Object.values(VALIDATION_MESSAGES).includes(error.message)
          ? error.message 
          : 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง';

        toast.error(errorMessage, {
          duration: 3000,
          position: 'bottom-right',
        });
    } finally {
      setIsLoading(false);
    }
  };  

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left section */}
      <div className="w-2/6 md:min-w-[400px] lg:min-w-[35vw] bg-white p-8 hidden md:flex items-center justify-center bg-gradient-to-tl from-primary/20 via-primary/0" >
        <div data-aos="zoom-out" data-aos-duration="1000" className="m-auto font-semibold lg:leading-[45px] md:leading-[40px] md:text-5xl lg:text-6xl">
          <h1 className="text-primary">Dormitory</h1>
          <h1 className="text-gray-800">Manager</h1>
        </div>
      </div>

      {/* Right section */}
      <div className="w-full bg-purple-5 p-8 flex flex-col justify-center">
        <div className="max-w-lg w-full mx-auto space-y-8">
          <div>
            <h2 className="text-4xl py-1 font-bold w-fit bg-gradient-to-bl from-primary to-[#3B82F6] bg-clip-text text-transparent">Register</h2>
            <p className="text-gray-600">มาเริ่มต้นสัมผัสประสบการณ์ใหม่ไปกับเราเลย</p>
            <p className="text-gray-600 text-sm">
              หรือมีบัญชีอยู่แล้ว? <Link href="login" className="text-blue-600 hover:underline">เข้าสู่ระบบ</Link>
            </p>
          </div>


          <form onSubmit={submitRegister} className="space-y-4">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="First Name / ชื่อ"
                    name="firstName"
                    className="w-full p-3 border border-gray-300 rounded-xl bg-white"
                    required={true}
                  />
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Last Name / นามสกุล"
                    name="lastName"
                    className="w-full p-3 border border-gray-300 rounded-xl bg-white"
                    required={true}
                  />
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Username / ชื่อผู้ใช้"
                  name="username"
                  className="w-full p-3 border border-gray-300 rounded-xl bg-white"
                  required={true}
                />
              </div>

              <div className="relative">
                <input
                  type="email"
                  placeholder="Email / อีเมล"
                  name="email"
                  className="w-full p-3 border border-gray-300 rounded-xl bg-white"
                  required={true}
                />
              </div>


              <div className="relative">
                <input
                  type="tel"
                  placeholder="Telephone / เบอร์โทรศัพท์"
                  name="telephone"
                  className="w-full p-3 border border-gray-300 rounded-xl bg-white"
                  required={true}
                  pattern="0[0-9]{9}"
                  title="กรุณากรอกหมายเลขโทรศัพท์ให้ถูกต้อง (เช่น 0812345678)"
                />
              </div>

              <div className="relative">
                <input
                  type="date"
                  placeholder="Date of Birth / วันเกิด"
                  name="dateOfBirth"
                  className="w-full p-3 border border-gray-300 rounded-xl bg-white"
                  required={true}
                />
              </div>

              <div className="relative">
                <textarea
                  placeholder="Address / ที่อยู่"
                  name="address"
                  className="w-full p-3 border border-gray-300 rounded-xl bg-white"
                  required={true}
                  rows={3}
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password / รหัสผ่าน"
                  name="password"
                  minLength={8}
                  className="w-full p-3 border border-gray-300 rounded-xl bg-white"
                  required={true}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password / ยืนยันรหัสผ่าน"
                  name="confirmedPassword"
                  minLength={8}
                  className="w-full p-3 border border-gray-300 rounded-xl bg-white"
                  required={true}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <input type="checkbox" id="terms" className="rounded border-gray-300" />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  ฉันได้อ่านและยอมรับเงื่อนไขการใช้งานตาม{" "}
                  <a href="#" className="text-blue-600 hover:underline">ข้อกำหนดการใช้บริการ</a>{" "}
                  และ{" "}
                  <a href="#" className="text-blue-600 hover:underline">ความเป็นส่วนตัว</a>
                </label>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังดำเนินการ...</span>
                </div>
                ) : (
                  "สร้างบัญชี"
                )}
              </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
