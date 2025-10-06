import React from 'react';
import { Home } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { DormType } from '../types';
import Image from 'next/image';

interface DormCardProps {
  dorm: DormType;
}

export const DormCard: React.FC<DormCardProps> = ({ dorm }) => {
  const { roomtypeid, description, roomtypeimg, roomprice, name } = dorm;
  
  return (
    <div className="bg-white border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
      <div className="h-56 bg-gray-200 flex items-center justify-center">
        <Image
          src={roomtypeimg}
          width={300}
          height={300}
          alt="Dormitory illustration"
          className="w-full h-56 object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{roomtypeid} {name}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-semibold text-primary">฿{roomprice.toLocaleString()}/เดือน</span>
        </div>
      </div>
    </div>
  );
};

export default DormCard;