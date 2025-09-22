"use client"

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  MessageSquare,
  Clock,
  AlertTriangle,
  Info,
  DownloadCloudIcon
} from 'lucide-react';
import SidebarUser from '@/components/SidebarUser';
import Footer from '@/components/Footer';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { apiFetch } from "@/lib/api";

// Message type
type Message = {
  id: number;
  message: string; 
  timestamp: string;
};


const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChats = async (showLoading: boolean) => {
      if (showLoading) setLoading(true);

      setShowLoading(true);
      setError(null);
      try {
        const response = await apiFetch('/chat', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json', 
          },
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch chats');
        }

        const data: Message[] = await response.json();
        // Sort by timestamp in ascending order (oldest first)
        const sortedData = data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        setMessages(sortedData);
      } catch (error: any) {
        setError(error.message);
        console.error("Error fetching chats:", error);
      } finally {
        setLoading(false);
        setShowLoading(false);
      }
    };

    fetchChats(true);
    setInterval(() => {
      fetchChats(false);
    }, 2500);
  }, []);


  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newMessage.trim() === "") return;

    setLoading(true);
    setShowLoading(true);
    setError(null);
    try {
      const response = await apiFetch('/chat', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
        },
        credentials: 'include',
        body: JSON.stringify({ message: newMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }

      const responseData = await response.json();
      const newMessageObj: Message = {
        id: responseData.insertedChat.id,
        message: responseData.insertedChat.message,
        timestamp: responseData.insertedChat.timestamp,
      };
      setMessages([...messages, newMessageObj]);
      setNewMessage("");

    } catch (error: any) {
      setError(error.message);
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
      setShowLoading(false);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { locale: th });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date"; 
    }
  };
  if (loading && messages.length === 0) {
    return <div className="text-center p-4">กำลังโหลด...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">เกิดข้อผิดพลาด: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex flex-1">
        <SidebarUser />

        <main className="flex-1 p-6 pt-16 md:pt-6 overflow-hidden flex flex-col h-screen">
          <div className="container mx-auto flex flex-col flex-1">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <MessageSquare className="w-6 h-6 mr-2 text-primary" />
                บอร์ดสนทนาหอพัก
              </h1>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    กฎการใช้งาน
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle>กฎการใช้งานบอร์ดสนทนา</AlertDialogTitle>
                    <AlertDialogDescription>
                      กรุณาปฏิบัติตามกฎเหล่านี้เพื่อสร้างพื้นที่ที่เป็นมิตรสำหรับทุกคน
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-2 mb-4">
                    <div className="flex gap-2">
                      <span className="font-bold">1.</span>
                      <p>ห้ามโพสต์ข้อความที่มีเนื้อหาไม่เหมาะสม คุกคาม หรือสร้างความเกลียดชัง</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold">2.</span>
                      <p>แม้จะเป็นข้อความนิรนาม แต่ทางผู้ดูแลสามารถระบุตัวผู้โพสต์ได้หากมีการละเมิดกฎ</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold">3.</span>
                      <p>ห้ามโพสต์ข้อมูลส่วนตัวของผู้อื่นโดยไม่ได้รับอนุญาต</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold">4.</span>
                      <p>ใช้พื้นที่นี้ในการสื่อสารและแบ่งปันข้อมูลที่เป็นประโยชน์ต่อผู้พักอาศัย</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold">5.</span>
                      <p>การรายงานปัญหาเกี่ยวกับห้องพักหรือสิ่งอำนวยความสะดวก ควรแจ้งผ่านระบบแจ้งซ่อมโดยตรง</p>
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogAction>เข้าใจแล้ว</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden mb-4">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-gray-600" />
                  <span className="font-medium">แชททั้งหมด ({messages.length})</span>
                </div>
                <div className="text-sm text-gray-500 flex items-center">
                  <Info className="w-4 h-4 mr-1" />
                  ทุกคนสามารถเห็นข้อความนี้
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-250px)]">
                {messages.map((message) => (
                  <div key={message.id} className="bg-gray-50 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex whitespace-normal">
                        <p className="text-gray-800 break-words">{message.message}</p>
                      </div>
                    </div>
                    <div className="flex justify-end mt-2">
                      <span className="text-xs text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatMessageTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-gray-200">
                <form onSubmit={handleSubmitMessage} className="flex gap-2">
                  <Input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="พิมพ์ข้อความของคุณที่นี่..."
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    className="flex items-center gap-2"
                    disabled={newMessage.trim() === "" || loading}
                  >
                    {loading ? 'กำลังส่ง...' : <> <Send className="w-4 h-4" /> ส่ง</>}
                  </Button>
                </form>
                <div className="flex flex-row justify-between items-center">
                  <p className="text-xs text-primary mt-4 flex items-start">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    ข้อความจะถูกโพสต์แบบไม่ระบุตัวตน แต่ต้องเป็นไปตาม
                    กฎการใช้งาน
                  </p>
                  {showLoading ? 
                  <span className='text-xs text-primary mt-4 transition-opacity'>
                    <DownloadCloudIcon size={14}/>
                  </span>
                  :
                  <span></span>
                  }
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default ChatPage;