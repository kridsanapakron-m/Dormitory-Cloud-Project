
import { Testimonial } from './types';
import { FAQ } from './types';
import { HOW } from './types';
import { Team } from './types';
import { DormType } from '../components/types';


//landing page

export const teamMembers: Team[] = [
  {
    name: "ณฐกร หอมพันนา",
    studentId: "66070055",
    role: "Project Manager",
    githubUrl: "https://github.com/MAK1z",
    email: "mailto:66070055@kmitl.ac.th",
    imageUrl: "/profile/namon.jpg"
  },
  {
    name: "อรุชา เขมทโรนนท์",
    studentId: "66070220",
    role: "Frontend Developer",
    githubUrl: "https://github.com/Annerez",
    email: "mailto:66070220@kmitl.ac.th",
    imageUrl: "/profile/arucha.png"
  },
  {
    name: "กฤษณปกรณ์ เมรัตรัน์",
    studentId: "66070006",
    role: "Backend Developer",
    githubUrl: "https://github.com/kirdsanapakron-m",
    email: "mailto:66070006@kmitl.ac.th",
    imageUrl: "/profile/krid.jpg"
  },
  {
    name: "คณิตพัฒน์ เตชะอัครเศรษฐ์",
    studentId: "66070245",
    role: "Backend Developer",
    githubUrl: "https://github.com/TKanidpat",
    email: "mailto:66070245@kmitl.ac.th",
    imageUrl: "/profile/tenten.jpg"
  }
];

export const reviews: Testimonial[] = [
  {
    id: 1,
    quote: "ระบบใช้งานง่าย สะดวกมากในการจัดการห้องพัก ช่วยประหยัดเวลาในการทำงานได้มาก",
    name: "คุณสมศักดิ์",
    role: "เจ้าของหอพัก",
    initial: "ส"
  },
  {
    id: 2,
    quote: "การแจ้งซ่อมและติดตามสถานะทำได้ง่าย ทีมงานตอบสนองรวดเร็ว ประทับใจมากครับ",
    name: "คุณวิชัย",
    role: "ผู้เช่า",
    initial: "ว"
  },
  {
    id: 3,
    quote: "ระบบจัดการค่าน้ำค่าไฟทำให้การชำระเงินสะดวกขึ้นมาก ไม่ต้องกังวลเรื่องการคำนวณ",
    name: "คุณฉงน",
    role: "ผู้จัดการหอพัก",
    initial: "น"
  }
];

export const faqs: FAQ[] = [
  {
    question: "การจองห้องพักมีขั้นตอนอย่างไร?",
    answer: "ขั้นตอนการจองห้องพักทำได้ง่ายๆ เพียงสมัครสมาชิก เลือกห้องที่ต้องการ กรอกข้อมูลการจอง และชำระเงินมัดจำ จากนั้นรอการยืนยันจากทางหอพัก"
  },
  {
    question: "มีช่องทางการชำระเงินอะไรบ้าง?",
    answer: "รองรับการชำระเงินหลากหลายช่องทาง ทั้งโอนผ่านธนาคาร, QR Code, บัตรเครดิต/เดบิต และการชำระเงินผ่านแอพพลิเคชั่นธนาคาร"
  },
  {
    question: "การแจ้งซ่อมใช้เวลานานไหม?",
    answer: "ระบบแจ้งซ่อมของเราตอบสนองรวดเร็ว โดยทั่วไปจะดำเนินการภายใน 24 ชั่วโมง สำหรับกรณีเร่งด่วนจะได้รับการดูแลทันที"
  },
  {
    question: "จองห้องแล้วไม่เอาได้ไหม?",
    answer: "สามารถทำได้ เพราะหารจองห้องเป็นแค่การดูห้องเฉยๆ และดูแล้วชอบถึงค่อยตกลงเอา"
  },
  {
    question: "ห้องมีสัญญานานแค่ไหน?",
    answer: "ห้องพักจะมีสัญญาอยู่ได้ 1 ปี หลังจากนั้นต้องทำสัญญาใหม่"
  },
  {
    question: "อยู่ตอนภาคเรียน Summer ได้ไหม?",
    answer: "สามารถพักอาศัยในภาคเรียนพิเศษได้ หอพักนักศึกษาให้บริการทั้งภาคเรียนที่ 1, 2, และภาคเรียนพิเศษ"
  },
  {
    question: "สามารถเปลี่ยนห้องระหว่างเทอมได้ไหม?",
    answer: "สามารถขอเปลี่ยนห้องได้ โดยต้องแจ้งความประสงค์ล่วงหน้าอย่างน้อย 30 วัน และต้องได้รับการอนุมัติจากผู้จัดการหอพัก ทั้งนี้ขึ้นอยู่กับห้องว่างที่มีในขณะนั้น"
  },
  {
    question: "มีบริการซักรีดในหอพักหรือไม่?",
    answer: "มีบริการซักรีดแบบหยอดเหรียญตั้งอยู่ที่ชั้น 1 ของแต่ละอาคาร เปิดให้บริการตลอด 24 ชั่วโมง โดยมีทั้งเครื่องซักผ้าและเครื่องอบผ้า"
  },
  {
    question: "กรณีมีของหายในหอพักต้องทำอย่างไร?",
    answer: "ให้แจ้งเจ้าหน้าที่หอพักทันทีเพื่อตรวจสอบกล้องวงจรปิด และกรอกแบบฟอร์มแจ้งของหาย โดยระบุรายละเอียดของที่หาย วันเวลา และสถานที่ที่คาดว่าทำหาย เพื่อให้เจ้าหน้าที่ช่วยตรวจสอบและติดตาม"
  },
  {
    question: "มีระบบรักษาความปลอดภัยอย่างไรบ้าง?",
    answer: "เรามีระบบรักษาความปลอดภัย 24 ชั่วโมง พร้อมกล้องวงจรปิด ระบบคีย์การ์ด และพนักงานรักษาความปลอดภัยตลอดวัน"
  }
];


export const HowTo: HOW[] = [
  { 
    icon: (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />), 
    title: "จองห้องพัก", 
    description: "เลือกห้องพักเพื่อทำการนัดดูห้อง" 
  },
  { 
    icon: (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />), 
    title: "ยืนยันการจอง", 
    description: "ชำระเงินมัดจำและยืนยันการจอง" 
  },
  { 
    icon: (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />), 
    title: "เข้าพัก", 
    description: "รับกุญแจและเข้าพักในห้องใหม่" 
  }
];

export const dorms: DormType[] = [
  {
    id: '1',
    title: 'Type A',
    description: 'ห้องพักมาตรฐาน พร้อมเฟอร์นิเจอร์ครบครัน',
    image: "/room/typea.png",
    price: 8400,
    building: 'new',
    features: [
      'เตียงนอน 2 เตียง',
      'โต๊ะทำงานพร้อมเก้าอี้',
      'ตู้เสื้อผ้า',
      'เครื่องปรับอากาศ',
      'ห้องน้ำในตัว',
      'ตู้เย็น'
    ],
    amenities: [
      'โซนซักผ้า',
      'ห้องอ่านหนังสือ',
      'ระบบรักษาความปลอดภัย 24 ชม.',
      'Wi-Fi ความเร็วสูง'
    ]
  },
  {
    id: '2',
    title: 'Type B',
    description: 'ห้องพักมาตรฐาน พร้อมเฟอร์นิเจอร์ครบครัน',
    image: "/room/typeb.png",
    price: 12000,
    building: 'new',
    features: [
      'เตียงนอน 2 เตียง',
      'โต๊ะทำงานพร้อมเก้าอี้',
      'ตู้เสื้อผ้า',
      'เครื่องปรับอากาศ',
      'ห้องน้ำในตัว',
      'ตู้เย็น'
    ],
    amenities: [
      'โซนซักผ้า',
      'ห้องอ่านหนังสือ',
      'ระบบรักษาความปลอดภัย 24 ชม.',
      'Wi-Fi ความเร็วสูง'
    ]
  },
  {
    id: '3',
    title: 'Type C',
    description: 'ห้องพักขนาดใหญ่พิเศษ พร้อมเฟอร์นิเจอร์ครบครัน',
    image: "/room/typec.png",
    price: 13400,
    building: 'new',
    features: [
      'เตียงนอน 2 เตียง',
      'โต๊ะทำงานพร้อมเก้าอี้',
      'ตู้เสื้อผ้า',
      'เครื่องปรับอากาศ',
      'ห้องน้ำในตัว',
      'ตู้เย็น',
      'โซฟา'
    ],
    amenities: [
      'โซนซักผ้า',
      'ห้องอ่านหนังสือ',
      'ระบบรักษาความปลอดภัย 24 ชม.',
      'Wi-Fi ความเร็วสูง'
    ]
  },
];

export const getNewDorms = () => dorms.filter(dorm => dorm.building === 'new');
export const getOldDorms = () => dorms.filter(dorm => dorm.building === 'old');

//end of landing page

//login and register

export const VALIDATION_MESSAGES = {
  PASSWORD_MISMATCH: 'รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน',
  PASSWORD_LENGTH: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร',
  TERMS_REQUIRED: 'กรุณายอมรับข้อกำหนดการใช้บริการและความเป็นส่วนตัว',
  INVALID_PHONE: 'กรุณากรอกหมายเลขโทรศัพท์ให้ถูกต้อง (เช่น 0812345678)',
  GENERIC_ERROR: 'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง'
};

//end of login and register


export const ITEMS_PER_PAGE = 4;

export const movingIn = [
  {
    id: 1,
    name: "Supakorn Wacharasindhu",
    email: "supakorn@example.com",
    phone: "062-345-6789",
    Type: "Type A",
    preferredDate: new Date(2025, 2, 28, 14, 30),
    requestedOn: new Date(2025, 2, 25, 9, 15),
    status: "pending",
    expanded: false,
    additionalInfo: {
      UID: "65130500000",
      movingDate: new Date(2025, 3, 15),
      specialRequests: "Would prefer a room on the 3rd floor or higher with good natural light",
    }
  },
  {
    id: 2,
    name: "Kittipat Jarurak",
    email: "kittipat@example.com",
    phone: "081-234-5678",
    Type: "Double Room",
    preferredDate: new Date(2025, 2, 27, 10, 0),
    requestedOn: new Date(2025, 2, 24, 16, 45),
    status: "pending",
    expanded: false,
    additionalInfo: {
      UID: "65130500001",
      movingDate: new Date(2025, 3, 10),
      specialRequests: "Looking for a quiet area of the dormitory",
    }
  },
  {
    id: 3,
    name: "Chananya Sirisoontorn",
    email: "chananya@example.com",
    phone: "099-876-5432",
    Type: "Type B",
    preferredDate: new Date(2025, 2, 26, 13, 0),
    requestedOn: new Date(2025, 2, 23, 11, 30),
    status: "pending",
    expanded: false,
    additionalInfo: {
      UID: "65130500002",
      movingDate: new Date(2025, 3, 5),
      specialRequests: "Prefers a room with a good view",
    }
  },
  {
      id: 4,
      name: "Chananya Sirisoontorn",
      email: "chananya@example.com",
      phone: "099-876-5432",
      Type: "Type C",
      preferredDate: new Date(2025, 2, 26, 13, 0),
      requestedOn: new Date(2025, 2, 23, 11, 30),
      status: "pending",
      expanded: false,
      additionalInfo: {
        UID: "65130500002",
        movingDate: new Date(2025, 3, 5),
        specialRequests: "Prefers a room with a good view",
      }
    },
    {
      id: 5,
      name: "Chananya Sirisoontorn",
      email: "chananya@example.com",
      phone: "099-876-5432",
      Type: "Type A",
      preferredDate: new Date(2025, 2, 26, 13, 0),
      requestedOn: new Date(2025, 2, 23, 11, 30),
      status: "pending",
      expanded: false,
      additionalInfo: {
        UID: "65130500002",
        movingDate: new Date(2025, 3, 5),
        specialRequests: "Prefers a room with a good view",
      }
    },
    {
      id: 6,
      name: "Chananya Sirisoontorn",
      email: "chananya@example.com",
      phone: "099-876-5432",
      Type: "Type A",
      preferredDate: new Date(2025, 2, 26, 13, 0),
      requestedOn: new Date(2025, 2, 23, 11, 30),
      status: "pending",
      expanded: false,
      additionalInfo: {
        UID: "65130500002",
        movingDate: new Date(2025, 3, 5),
        specialRequests: "Prefers a room with a good view",
      }
    },
    {
      id: 7,
      name: "Chananya Sirisoontorn",
      email: "chananya@example.com",
      phone: "099-876-5432",
      Type: "Type A",
      preferredDate: new Date(2025, 2, 26, 13, 0),
      requestedOn: new Date(2025, 2, 23, 11, 30),
      status: "pending",
      expanded: false,
      additionalInfo: {
        UID: "65130500002",
        movingDate: new Date(2025, 3, 5),
        specialRequests: "Prefers a room with a good view",
      }
    },
]


// tenant page

export const TenantData = [
  {
    id: "U001",
    name: "ศุภกร ไม่รู้",
    email: "supakorn@example.com",
    phone: "062-345-6789",
    faculty: "Information Technology",
    yearOfStudy: "2nd Year",
    moveInDate: new Date(2024, 7, 15), // August 15, 2024
    leaseEndDate: new Date(2025, 5, 30), // June 30, 2025
    emergencyContact: "Sompong Wacharasindhu (Father) - 081-234-5678"
  },
  {
    id: "U002",
    name: "Kittipat Jarurak",
    email: "kittipat@example.com",
    phone: "081-234-5678",
    faculty: "Information Technology",
    yearOfStudy: "1st Year",
    moveInDate: new Date(2024, 7, 10), // August 10, 2024
    leaseEndDate: new Date(2025, 5, 30), // June 30, 2025
    emergencyContact: "Pranee Jarurak (Mother) - 089-765-4321"
  },
  {
    id: "U003",
    name: "Chananya Sirisoontorn",
    email: "chananya@example.com",
    phone: "099-876-5432",
    faculty: "Computer Engineering",
    yearOfStudy: "3rd Year",
    moveInDate: new Date(2023, 5, 5), // June 5, 2023
    leaseEndDate: new Date(2025, 5, 30), // June 30, 2025
    emergencyContact: "Wiroj Sirisoontorn (Father) - 062-987-6543"
  },
  {
    id: "U004",
    name: "Thanawat Jarusutthirak",
    email: "thanawat@example.com",
    phone: "099-765-4321",
    faculty: "Information Technology",
    yearOfStudy: "2nd Year",
    moveInDate: new Date(2023, 7, 20), // August 20, 2023
    leaseEndDate: new Date(2025, 5, 30), // June 30, 2025
    emergencyContact: "Sakchai Jarusutthirak (Father) - 081-432-5678"
  },
  {
    id: "U005",
    name: "Pattharaphon Sopiwong",
    email: "pattharaphon@example.com",
    phone: "089-987-6543",
    faculty: "Information Technology",
    yearOfStudy: "1st Year",
    moveInDate: new Date(2024, 6, 1), // July 1, 2024
    leaseEndDate: new Date(2025, 5, 30), // June 30, 2025
    emergencyContact: "Malee Sopiwong (Mother) - 086-234-5678"
  }
];

export const initialRooms = [
  { 
    roomNumber: "12011", 
    floor: 9, 
    type: "Single", 
    status: "occupied", 
    tenantId: "U001",
    monthlyRent: 7500
  },
  { 
    roomNumber: "913", 
    floor: 9, 
    type: "Single", 
    status: "occupied", 
    tenantId: "U001",
    monthlyRent: 7500
  },
  { 
    roomNumber: "924", 
    floor: 9, 
    type: "Single", 
    status: "occupied", 
    tenantId: "U001",
    monthlyRent: 7500
  },
  { 
    roomNumber: "914", 
    floor: 9, 
    type: "Single", 
    status: "occupied", 
    tenantId: "U001",
    monthlyRent: 7500
  },
  { 
    roomNumber: "923", 
    floor: 9, 
    type: "Single", 
    status: "occupied", 
    tenantId: "U001",
    monthlyRent: 7500
  },
  { 
    roomNumber: "805", 
    floor: 8, 
    type: "Double", 
    status: "occupied", 
    tenantId: "U002",
    monthlyRent: 6000
  },
  { 
    roomNumber: "621", 
    floor: 6, 
    type: "Single", 
    status: "occupied", 
    tenantId: "U003",
    monthlyRent: 7500
  },
  { 
    roomNumber: "302", 
    floor: 3, 
    type: "Single Premium", 
    status: "occupied", 
    tenantId: "U004",
    monthlyRent: 8500
  },
  { 
    roomNumber: "415", 
    floor: 4, 
    type: "Double", 
    status: "occupied", 
    tenantId: "U005",
    monthlyRent: 6000
  },
  { 
    roomNumber: "710", 
    floor: 7, 
    type: "Single", 
    status: "vacant", 
    tenantId: null,
    monthlyRent: 7500
  },
  { 
    roomNumber: "508", 
    floor: 5, 
    type: "Single Premium", 
    status: "vacant", 
    tenantId: null,
    monthlyRent: 8500
  }
];
export const jwtsecret = 'sec9rity'
