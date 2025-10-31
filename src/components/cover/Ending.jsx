import ImgCanvas from "@/components/ImgCanvas";

export default function Ending({ name_en, name_kr, date, imgUrl }) {
    const ending = [
        '두 사람이 하나 되어 아름다운 가정을 꾸려나가는 소중한 시작을 함께 축복해주시면 감사하겠습니다.',
        '바쁘신 와중에도 귀한 발걸음으로 참석해주시는 모든 분들께 진심으로 감사드립니다.',
        '저희 두 사람의 앞날에 따뜻한 격려와 축복을 부탁드립니다.'
    ]
    return (
        <div id="ending" className="w-full relative rounded-b-3xl overflow-hidden">
            <h5 className="z-10 w-full pt-15 text-white absolute text-6xl leading-snug px-2 font-loving text-center">
                <p>Thank You</p>
            </h5>
            <ImgCanvas imgUrl={imgUrl} type="tuliip" />
            <div className="text-base w-full absolute bottom-20 z-10 text-center px-8 space-y-4 leading-7 font-saeum text-xl">
                {ending && ending.map((e, i) => (
                    e.length > 0 ? (
                        <p key={`ending-${i}`} className="text-white">{e}</p>
                    ) : (
                        <br key={`br-${i}`} />
                    )
                ))}
            </div>
        </div>
    )
}