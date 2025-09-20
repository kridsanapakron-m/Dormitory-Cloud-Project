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
  const { title, description, image, price, features, amenities } = dorm;
  
  return (
    <div className="bg-white border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
      <div className="h-56 bg-gray-200 flex items-center justify-center">
        <Image
          src={image}
          width={300}
          height={300}
          alt="Dormitory illustration"
          className="w-full h-56 object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-semibold text-primary">฿{price.toLocaleString()}/เดือน</span>
          <Dialog>
            <DialogTrigger asChild>
              <button className="bg-primary text-white px-4 py-2 rounded-md transition duration-300 hover:bg-blue-600 hover:scale-110">
                ดูรายละเอียด
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <h4 className="font-semibold">รายละเอียด</h4>
                  <p className="text-gray-600">{description}</p>
                </div>
                <div className="grid gap-2">
                  <h4 className="font-semibold">ราคา</h4>
                  <p className="text-primary font-medium">฿{price.toLocaleString()}/เดือน</p>
                </div>
                {features && (
                  <div className="grid gap-2">
                    <h4 className="font-semibold">สิ่งอำนวยความสะดวกในห้อง</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {features.map((feature, index) => (
                        <li key={index} className="text-gray-600">{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {amenities && (
                  <div className="grid gap-2">
                    <h4 className="font-semibold">สิ่งอำนวยความสะดวกส่วนกลาง</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {amenities.map((amenity, index) => (
                        <li key={index} className="text-gray-600">{amenity}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default DormCard;