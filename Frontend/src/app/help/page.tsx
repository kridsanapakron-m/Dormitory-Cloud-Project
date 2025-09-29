"use client"

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { TeamMember } from '@/components/landing/team';
import { teamMembers } from '@/components/data';
import Footer from '@/components/Footer';


const HelpSupport = () =>
{

    const router = useRouter();

    const handleGoBack = () => {
      router.back();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <button
            onClick={handleGoBack}
            className="flex items-center gap-2 px-4 py-2 transition-all duration-200 hover:scale-105 m-8 w-32 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg"
            aria-label="ย้อนกลับ"
            >
                <ArrowLeft size={20} />
                <span className="font-medium">ย้อนกลับ</span>
            </button>
            <section id="team" className="py-20 pt-24 lg:pt-40 mb-16">
                <div className="container mx-auto px-4  ">
                    <div className="text-center mb-24 max-w-[1280px] mx-auto">
                        <h1 data-aos="fade-up" className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent 
                         inline-block py-2 px-1 leading-relaxed">
                            ติดต่อสอบถามและขอความช่วยเหลือได้ที่
                        </h1>
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
};

export default HelpSupport