import ImgCanvas from "@/components/ImgCanvas";
import { useEffect, useState } from "react";
import { TbTriangleFilled } from "react-icons/tb";

export default function Cover({ wedding_data, imgUrl }) {
    const wedding_date = dayjs(wedding_data?.wedding_date).locale('en');
    const day = wedding_date?.format('MMM D, YYYY');
    const time = wedding_date?.format('ddd · hh:mm A');

    const img1 = imgUrl.split(',')[0];
    const img2 = imgUrl.split(',')[1];

    const [showText, setShowText] = useState(false);

    useEffect(() => {
        if (!utils.isEmpty(wedding_data)) {
            setShowText(true);
        }
    }, [wedding_data]);

    return (
        <div id="cover" className="w-full relative lg:rounded-t-3xl overflow-hidden">
            <div className="w-full p-10 space-y-5 flex flex-col items-center justify-center">
                <div className="aspect-square w-full h-auto relative shadow-sm rounded-xl">
                    <div className="uppercase absolute bottom-1 -left-1.5 z-20 whitespace-nowrap transform -rotate-90 origin-bottom-left flex items-center">
                        <div className="flex items-center gap-1">
                            <span className={`transition-all duration-800 ease-initial ${showText ? 'opacity-100' : 'opacity-0'}`}>{ time }</span>
                        </div>
                    </div>
                    <div className="uppercase absolute top-1 -right-1.5 z-20 whitespace-nowrap transform -rotate-90 origin-top-right flex items-center">
                        <div className="flex items-center gap-2">
                            <div className="rotate-90">
                                <TbTriangleFilled />
                            </div>
                            <div>13A</div>
                        </div>
                    </div>
                    <div className="absolute top-0 left-0 w-full h-full bg-transparent z-10"></div>
                    <ImgCanvas imgUrl={img1} rounded={true} />
                </div>
                <div className="absolute -right-[4.5rem] z-20">
                    <div className="relative w-48 h-4 -rotate-90">
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
                            <span className={`inline-block transition-all duration-800 ease-initial ${showText ? 'opacity-100' : 'opacity-0'}`}>{ [wedding_data?.groom_en, wedding_data?.bride_en].join(' & ') }</span>
                        </div>
                    </div>
                </div>
                <div className="aspect-square w-full h-auto relative shadow-sm rounded-xl">
                    <div className="uppercase absolute bottom-1 -left-1.5 z-20 whitespace-nowrap transform -rotate-90 origin-bottom-left flex items-center">
                        <div className="flex items-center gap-1.5">
                            <span className={`transition-all duration-800 ease-initial ${showText ? 'opacity-100' : 'opacity-0'}`}>{ day }</span>
                        </div>
                    </div>
                    <div className="uppercase absolute bottom-1 -right-[5.4rem] z-20 whitespace-nowrap transform -rotate-90 origin-bottom-left flex items-center">
                        <div className="flex items-center gap-2">
                            <div className="rotate-90">
                                <TbTriangleFilled />
                            </div>
                            <div>12A</div>
                        </div>
                    </div>
                    <div className="absolute top-0 left-0 w-full h-full bg-transparent z-10"></div>
                    <ImgCanvas imgUrl={img2} rounded={true} type="maple" />
                </div>
            </div>
        </div>
    )
}