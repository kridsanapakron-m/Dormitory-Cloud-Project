import type { Metadata } from "next";
import { lineSeed } from './fonts'
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"

import AOSProvider from '../components/AOSProvider';

export const metadata: Metadata = {
  title: "หอพักนักศึกษา",
  description: "ระบบจัดการหอพักนักศึกษาแบบ end-to-end",
  icons: {
    icon: '/italy.svg',
  },
};




export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lineSeed.variable} font-line-seed antialiased`}
      >
        <AOSProvider>
        {children}
        </AOSProvider>
        <Toaster
          theme="light"
          richColors
          className="font-line-seed w-[500px]"
          toastOptions={{
            style: {
              fontSize: '10px',
              fontFamily: 'LINE Seed Sans TH',
              minWidth: 'fit-content'
            },
            classNames: {
              toast: 'font-line-seed',
              title: 'font-line-seed text-xs md:text-lg whitespace-nowrap overflow-hidden text-ellipsis',
              description: 'font-line-seed text-sm',
            },
          }}
        />
      </body>
    </html>
  );
}
