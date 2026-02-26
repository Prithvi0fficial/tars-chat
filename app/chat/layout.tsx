"use client";

import Sidebar from "../../components/Sidebar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen bg-gray-100 flex justify-center">

      {/* Center container (fixes ugly wide screen) */}
      <div className="w-full max-w-[1400px] h-full flex shadow-lg bg-white">

        {/* Sidebar */}
        <div className="hidden md:block w-80 border-r">
          <Sidebar />
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {children}
        </div>

      </div>
    </div>
  );
}