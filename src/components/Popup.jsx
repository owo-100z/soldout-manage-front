import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { HiX } from "react-icons/hi";

let scrollY = 0;

export default function Popup({ onClose, children, title="" }) {
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        const y = window.scrollY;
        if (y === 0) return;

        scrollY = y;

        document.body.style.position = "fixed";
        document.body.style.top = `-${y}px`;
        
        setShowPopup(true);
    }, []);

    const close = () => {
        document.body.style.position = "";
        document.body.style.top = "";
        window.scrollTo(0, scrollY);
        setShowPopup(false);
        setTimeout(() => {
            onClose();
        }, 300);
    }

    return createPortal(
        <div
            className={`fixed inset-0 bg-black/70 flex items-center justify-center text-center z-[999] w-full h-full max-w-md mx-auto lg:w-[400px] duration-200 ease-initial
                    ${showPopup ? "opacity-100 translate-y-0" : "opacity-0 translate-y-50" }`
            }
        >
            <div
                className="bg-white p-6 w-full h-full overflow-y-auto"
                style={{ scrollbarWidth: 'none' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="h-14">
                    {title && (
                        <>
                            <h2 className={`text-md mb-4 duration-300 ease-in
                                ${showPopup ? "opacity-70 translate-y-0" : "opacity-0 translate-y-5" }`}
                            >
                                {title}
                            </h2>
                            <div data-orientation="horizontal" role="none" className="shrink-0 h-[1px] w-full my-5 bg-black opacity-10" />
                        </>
                    )}
                    <button id="_popup_close" onClick={close} className='z-[1000] absolute top-5 right-6 cursor-pointer'>
                        <HiX className="text-2xl opacity-50" />
                    </button>
                </div>
                <div className={`duration-300 ease-in
                    ${showPopup ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5" }`}
                >
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}