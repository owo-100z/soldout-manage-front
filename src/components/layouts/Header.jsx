import { useRef, useState, useEffect } from "react";
import { IoHomeOutline, IoSettingsOutline } from "react-icons/io5";

export default function Header() {
  useEffect(() => {

  }, []);

  const goMenu = (menu) => {
    location.href = `/${menu}`;
  }

  return (
    <header className='fixed inset-0 w-full h-[40px] max-w-5xl mx-auto top-0 z-50'>
      <div className='h-full w-full'>
        <div className="bg-white/70 backdrop-blur-md shadow-md h-full flex items-center">
            <div className="container mx-auto flex justify-between px-4">
              <IoHomeOutline className="cursor-pointer text-xl" onClick={() => {goMenu('')}} />
              <IoSettingsOutline className="cursor-pointer text-xl" onClick={() => {goMenu('admin')}} />
            </div>
        </div>
      </div>
    </header>
  );
}
