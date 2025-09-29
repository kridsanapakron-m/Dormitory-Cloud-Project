"use client"

import React, { useState } from 'react';
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from 'next/navigation'
import { Globe, Phone, CalendarCheck, CreditCard, Wrench, Lightbulb, SprayCan, Receipt, Clock, FileCheck, QrCode, Calculator, Mail, Home, Building2  } from 'lucide-react';
import { motion } from 'framer-motion';

import { teamMembers, faqs, reviews, HowTo } from '@/components/data';
import { getNewDorms } from '@/components/data';

import { TestimonialCard } from '@/components/landing/testimonial';
import { TeamMember } from '@/components/landing/team';
import { DormCard } from '@/components/landing/dorm';

import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";

export default function HomePage() {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const newDorms = getNewDorms();

  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.3 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      transition: { duration: 0.1 }
    },
    tap: { scale: 0.95 }
  };

  return (
    <div className="min-h-screen bg-purple-50">
      <Navbar />

      <main id="home" className="container mx-auto px-4 md:px-6 pt-40 md:pt-16 min-h-screen flex flex-col md:flex-row items-center justify-center">
      <motion.div 
        className="md:w-1/2 space-y-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 1}}
        
      >
        <motion.div className="space-y-2 text-4xl md:text-5xl lg:text-6xl font-bold" variants={itemVariants}>
          <h1 
            className="bg-gradient-to-r text-transparent bg-clip-text w-fit from-blue-500 to-primary text-4xl md:text-5xl lg:text-6xl font-bold"
          >
            ยินดีต้อนรับ
          </h1>
          <h2>สู่ระบบ</h2>
          <h3>การจัดการหอพัก</h3>
        </motion.div>

        <motion.p 
          className="text-gray-600 mt-4"
          variants={itemVariants}
        >
          เป็นระบบออนไลน์ที่ใช้เพื่อดูแลและจัดการ &quot;การบริหารหอพัก&quot; ให้มีประสิทธิภาพมากที่สุด
        </motion.p>

        <motion.ul 
          className="space-y-2 text-gray-600"
          variants={containerVariants}
        >
          {[
            'ระบบช่วยจัดการข้อมูลผู้เช่า ห้องพัก',
            'ระบบช่วยในการบันทึกค่าน้ำ ค่าไฟและค่าเช่าห้อง',
            'ระบบจัดการห้องพักภายใน'
          ].map((text, index) => (
            <motion.li 
              key={index}
              className="flex items-center"
              variants={itemVariants}
            >
              <span className="text-primary mr-2">✓</span>
              {text}
            </motion.li>
          ))}
        </motion.ul>

        <motion.div 
          className="flex space-x-4 mt-8"
          variants={containerVariants}
        >
          <motion.button
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-purple-500"
            onClick={() => router.push('/login')}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            เข้าสู่ระบบ
          </motion.button>
          <motion.button
            className="border border-purple-500 text-purple-500 px-6 py-2 rounded-md hover:bg-purple-50"
            onClick={() => router.push('/queue')}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            นัดชมห้อง
          </motion.button>
        </motion.div>
      </motion.div>

      <motion.div 
        className="md:w-1/2 mt-8 md:mt-0"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.5 }}}
        viewport={{ once: false, amount: 1}}
      >
        <motion.div 
          className="rounded-full overflow-hidden p-8"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <Image
            src="/italy.svg"
            width={24}
            height={24}
            alt="Dormitory illustration"
            className="w-full h-auto"
          />
        </motion.div>
      </motion.div>
    </main>

      <div
        id="products"
        className="flex justify-center pt-24 lg:pt-32 px-6 2xl:px-0"
      >
        <div className="max-w-[1280px]">
          <div className="text-center mb-12 mb:mb-16">
            <h1 data-aos="fade-up" className="text-3xl md:text-4xl font-semibold">Our Services</h1>
            <p data-aos="fade-up" className="text-lg md:text-xl text-primary">บริการของเรา</p>
          </div>

          <div  data-aos="fade-up" className="aos-init aos-animate flex justify-between p-6 border-2 border-primary rounded-2xl bg-gradient-to-br from-primary/20 via-primary/0 mb-12">
            <div>
              <div className="w-[80px] h-[80px] rounded-xl bg-primary flex justify-center items-center -mt-12 mb-6">
                  <Globe className='text-white w-1/2 h-1/2' />
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold mb-2">
                บริการหอในที่ ง่าย ครบ จบ ในที่เดียว
              </h1>
              <p className="w-full md:w-[600px] mb-6">
                เว็บไซต์ของเราให้บริการครอบคลุมทุกอย่างในการให้บริการหอพัก ที่จะช่วยให้การหาที่พักและการจัดการหอพักเป็นเรื่องง่าย
                ไม่ว่าจะเป็นการค้นหาห้องพัก การจองห้องพัก การชำระเงิน การแจ้งซ่อม การจัดการต่างๆ ของหอพัก และการติดต่อสื่อสารระหว่างผู้เช่าและผู้ให้เช่า 
                ทั้งหมดรวมไว้ในเว็ปไซต์ที่นี่ ที่เดียว
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 bg-blue-100 p-3 rounded-lg">
                  <div className="bg-primary p-2 rounded-lg">
                    <Wrench className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm md:text-base">แจ้งซ่อมอุปกรณ์ไฟฟ้าและเครื่องปรับอากาศ</span>
                </div>
                <div className="flex items-center gap-2 bg-blue-100 p-3 rounded-lg">
                  <div className="bg-primary p-2 rounded-lg">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm md:text-base">แจ้งปัญหาอุปกรณ์ในห้องพัก</span>
                </div>
                <div className="flex items-center gap-2 bg-blue-100 p-3 rounded-lg">
                  <div className="bg-primary p-2 rounded-lg">
                   <SprayCan className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm md:text-base">ขอบริการทำความสะอาด</span>
                </div>
                <div className="flex items-center gap-2 bg-blue-100 p-3 rounded-lg">
                  <div className="bg-primary p-2 rounded-lg">
                  < Receipt className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm md:text-base">ติดตามธุรกรรมย้อนหลัง</span>
                </div>
              </div>
            </div>
            <div className="w-full hidden xl:flex justify-center items-center">
              <Image
                width={150}
                height={24}
                className="w-[200px] z-10 translate-x-28 translate-y-20 drop-shadow-xl rounded-lg"
                src="/admin2.png"
                alt="ezdn"
              />
              <Image
                width={300}
                height={24}
                className="w-[300px] z-0 drop-shadow-xl rounded-lg"
                src="/admin.png"
                alt="Admin Page"
              />
              <Image
                width={200}
                height={24}
                className="w-[220px] z-10 -translate-x-20 -translate-y-16 drop-shadow-xl rounded-lg"
                src="/admin1.png"
                alt="bloxcodeth"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8 mb-12">
            <div data-aos="flip-left" className="p-6 border border-red-500 bg-gradient-to-br from-red-500/20 via-red-500/0 rounded-2xl">
              <div className="-mt-12 w-[60px] h-[60px] flex justify-center items-center rounded-lg bg-red-500 mb-4">
                <Phone className='text-white w-1/2 h-1/2' />
              </div>
              <h1 className="text-xl md:text-2xl font-semibold mb-2">
                เรียกใช้บริการช่าง/แม่บ้าน
              </h1>
              <p className="text-sm md:text-base mb-4">
                ระบบแจ้งซ่อมและขอความช่วยเหลือจากช่างเทคนิคและแม่บ้านประจำหอพัก
                สามารถแจ้งปัญหาอุปกรณ์ในห้องพัก ระบบไฟฟ้า เครื่องปรับอากาศ
                หรือขอความช่วยเหลือด้านความสะอาดได้อย่างรวดเร็ว
                พร้อมติดตามสถานะงานและประเมินการให้บริการได้ผ่านระบบออนไลน์
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 bg-red-100 p-3 rounded-lg">
                  <div className="bg-red-500 p-2 rounded-lg">
                    <Wrench className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm md:text-base">บริการแจ้งซ่อมอุปกรณ์ชำรุด</span>
                </div>
                <div className="flex items-center gap-2 bg-red-100 p-3 rounded-lg">
                  <div className="bg-red-500 p-2 rounded-lg">
                    <SprayCan className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm md:text-base">บริการทำความสะอาดห้องพัก</span>
                </div>
              </div>
            </div>

            <div data-aos="flip-right" className="p-6 border border-red-500 bg-gradient-to-br from-red-500/20 via-red-500/0 rounded-2xl">
              <div className="-mt-12 w-[60px] h-[60px] flex justify-center items-center rounded-lg bg-red-500 mb-4">
                <CalendarCheck  className='text-white w-1/2 h-1/2' />
              </div>
              <h1 className="text-xl md:text-2xl font-semibold mb-2">
                จองห้องออนไลน์
              </h1>
              <p className="text-sm md:text-base mb-4">
                ระบบจองห้องออนไลน์ช่วยให้ผู้เช่าห้องพัก สามารถจองดูห้องพักได้ล่วงหน้า และดูแลการใช้งานได้อย่างทั่วถึง
                สามารถตรวจสอบตารางการใช้งานห้อง การจองห้อง และยกเลิกการจองได้ตลอด 24 ชั่วโมง 
                เพื่อการบริหารจัดการทรัพยากรของหอพักให้เกิดประโยชน์สูงสุด
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 bg-red-100 p-3 rounded-lg">
                  <div className="bg-red-500 p-2 rounded-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm md:text-base">จองล่วงหน้าได้ 24 ชั่วโมง</span>
                </div>
                <div className="flex items-center gap-2 bg-red-100 p-3 rounded-lg">
                  <div className="bg-red-500 p-2 rounded-lg">
                    <FileCheck className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm md:text-base">ติดตามสถานะการจองห้อง</span>
                </div>
              </div>
            </div>
          </div>


          <div data-aos="flip-right"  className="grid grid-cols-1 gap-10 md:gap-8 mb-8">
            <div className="p-6 border border-primary bg-gradient-to-br from-primary/20 via-primary/0 rounded-2xl">
              <div className="-mt-12 w-[60px] h-[60px] flex justify-center items-center rounded-lg bg-primary mb-4">
                <CreditCard  className='text-white w-1/2 h-1/2' /> 
              </div>
              <h1 className="text-xl md:text-2xl font-semibold mb-2">
                ระบบชำระค่าใช้จ่ายแบบครบครัน
              </h1>
              <p className="text-sm md:text-base mb-4">
                ระบบแจ้งการใช้งานรายเดือน ทั้งฝั่งผู้ใช้และผู้ดูแล สามารถตรวจสอยได้ง่ายๆ ผ่านเว้ปไซต์ของเรา
                พร้อมกับการจ่ายต่าเช่าออนไลน์ผ่าน Promptpay QRCode เพื่อบริการ และคุณภาพการใช้งานที่สะดวกที่สุดสำหรับทั้งสองฝั่ง
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 bg-primary/10 p-3 rounded-lg">
                  <div className="bg-primary p-2 rounded-lg">
                    <QrCode className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm md:text-base">ชำระง่ายๆ ผ่าน Promptpay QR Code</span>
                </div>
                <div className="flex items-center gap-2 bg-primary/10 p-3 rounded-lg">
                  <div className="bg-primary p-2 rounded-lg">
                    <Calculator className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm md:text-base">รวมค่าใช้จ่ายทุกอย่างในที่เดียว</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>


      <section className="mt-32" ref={ref}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-24">
            <h1 data-aos="fade-up" className="text-3xl md:text-4xl font-semibold">สถิติหอพักของเรา</h1>
            <p data-aos="fade-up" className="text-lg md:text-xl text-primary">ให้บริการที่ดีเยี่ยม</p>
          </div>
          <div data-aos="fade-up"  className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          {[
            { value: 100, label: "ห้องพัก" },
            { value: 1000, label: "ผู้เช่า" },
            { value: 24, label: "บริการตลอด", suffix: "/7" },
            { value: 98, label: "ความพึงพอใจ", suffix: "%" },
          ].map((stat, index) => (
            <div key={index}>
              <h3 className="text-4xl font-bold text-primary">
                {inView && (
                  <CountUp start={0} end={stat.value} duration={4} suffix={stat.suffix || ""} />
                )}
              </h3>
              <p className="text-gray-600 pt-2">{stat.label}</p>
            </div>
          ))}

          </div>
        </div>
      </section>


      <section id="dorm-type" className="pt-24 lg:pt-40">
        <div className="container mx-auto px-4 max-w-[1280px]">
          <div data-aos="fade-up" className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-semibold">ประเภทห้องพัก</h1>
            <p className="text-lg md:text-xl text-primary">หลากหลายรูปแบบให้เลือก</p>
          </div>

          <h2  data-aos="zoom-out-right"  className="text-3xl text-primary font-semibold my-6">ตึกใหม่</h2>
          <div data-aos="fade-up" className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {newDorms.map(dorm => (
            <DormCard key={dorm.id} dorm={dorm} />
          ))}
          </div>
        </div>
      </section>

      <section id="step" className="py-16 pt-24 lg:pt-40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24">
            <h1 data-aos="fade-up" className="text-3xl md:text-4xl font-semibold">ขั้นตอนการเช่าห้องพัก</h1>
            <p data-aos="fade-up" className="text-lg md:text-xl text-primary">ง่ายๆ แค่ไม่กี่ขั้นตอน</p>
          </div>
          <div data-aos="zoom-in-up" className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HowTo.map((step, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto w-20 h-20 mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {step.icon}
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

  
      <section className="pt-24 lg:pt-40 flex justify-center">
        <div className="container mx-auto px-4 max-w-[1280px]">
          <div className="text-center mb-24">
            <h1 data-aos="fade-up" className="text-3xl md:text-4xl font-semibold">เสียงจากผู้ใช้งานของเรา</h1>
            <p data-aos="fade-up" className="text-lg md:text-xl text-primary">สะท้อนคุณภาพบริการของเรา</p>
          </div>
          <div data-aos="flip-up" className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((testimonial) => (
              <TestimonialCard key={testimonial.id} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 pt-24 lg:pt-40">
        <div className="container mx-auto px-4 max-w-[1280px]">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div data-aos="flip-right" className="md:w-1/2">
              <h2 className="text-4xl font-bold mb-6 text-primary">สถานที่ตั้ง</h2>
              <p className="text-gray-600 mb-4">
                หอพักนักศึกษาสจล. 1 ถ. ฉลองกรุง แขวงลาดกระบัง<br />
                เขตลาดกระบัง กรุงเทพมหานคร 10520
              </p>
              <p className="text-gray-600">
                เดินทางสะดวกด้วยรถไฟฟ้า รถไฟ และรถโดยสารประจำทาง
              </p>
            </div>
            <div className="md:w-1/2">
              <div data-aos="flip-left" className="rounded-xl overflow-hidden shadow-lg">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d751.978130109895!2d100.7742791176281!3d13.729006555356959!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x311d664a2b9c8ef9%3A0x8d13a1d2e40db4f0!2sKMITL%20Student%20Dormitory!5e0!3m2!1sth!2sth!4v1740216130804!5m2!1sth!2sth"
                  className="w-full h-96"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>




    <section id="faq" className='bg-purple-50 pt-24 lg:pt-40'>
      <div className='container mx-auto px-4'>
        <div className="text-center mb-12">
            <h1 data-aos="fade-up" className="text-3xl md:text-4xl font-semibold">FAQs</h1>
            <p  data-aos="fade-up"  className="text-lg md:text-xl text-primary">คำถามที่พบบ่อย</p>
          </div>
        <div  data-aos="fade-up" className='w-4/5 lg:w-3/5 mx-auto space-y-4'>
          {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-semibold text-lg text-gray-900">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                className={`px-6 overflow-hidden transition-all duration-200 ${
                  openIndex === index ? 'py-4' : 'max-h-0'
                }`}
              >
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>



    <section id="team" className="py-20 pt-24 lg:pt-40 mb-16">
        <div className="container mx-auto px-4  ">
          <div className="text-center mb-24 max-w-[1280px] mx-auto">
          <h1 data-aos="fade-up" className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-pink-500  text-transparent bg-clip-text animate-gradient">
            Meet The Developer Team
          </h1>
            <p data-aos="fade-up" className="text-lg md:text-xl text-gray-600 mt-4">เด็ก IT 4 คนที่ต้องประสบภัยโปรเจค</p>
          </div>
          
          <div data-aos="flip-up" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <TeamMember key={member.studentId} {...member} />
            ))}
          </div>
        </div>
      </section>

    <Footer />
    </div>
  );
}
