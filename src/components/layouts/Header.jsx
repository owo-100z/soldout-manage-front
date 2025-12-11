import { useRef, useState, useEffect } from "react";
import { IoHomeOutline, IoSettingsOutline } from "react-icons/io5";

export default function Header() {
  const [scale, setScale] = useState('scale-100');
  useEffect(() => {

  }, []);

  const goMenu = (menu) => {
    location.href = `/${menu}`;
  }

  const upscale = () => {
    document.querySelector('body').classList.remove(scale);
    document.querySelector('header').classList.remove('top-25', 'top-45');
    document.querySelector('#home').classList.remove('mt-20', 'mt-40');

    if (scale === 'scale-100') {
      setScale('scale-120');
      document.querySelector('body').classList.add('scale-120');
      document.querySelector('header').classList.add('top-25');
      document.querySelector('#home').classList.add('mt-20');
    }
    else if (scale === 'scale-120') {
      setScale('scale-140');
      document.querySelector('body').classList.add('scale-140');
      document.querySelector('header').classList.add('top-45');
      document.querySelector('#home').classList.add('mt-40');
    } else {
      setScale('scale-100');
    }
  }

  return (
    <header className='fixed inset-0 w-full h-[50px] max-w-5xl mx-auto top-0 z-50'>
      <div className='h-full w-full'>
        <div className="bg-white/70 backdrop-blur-md shadow-md h-full flex items-center">
            <div className="container mx-auto flex justify-between px-4">
              <div className="flex items-center gap-4">
                <IoHomeOutline className="cursor-pointer text-xl" onClick={() => {goMenu('')}} />
              </div>
              <div className="flex items-center gap-4">
                <button className="btn btn-md btn-outline text-2xl" onClick={upscale}>확대/축소</button>
                <IoSettingsOutline className="cursor-pointer text-xl" onClick={() => {goMenu('admin')}} />
              </div>
            </div>
        </div>
      </div>
    </header>
  );
}
