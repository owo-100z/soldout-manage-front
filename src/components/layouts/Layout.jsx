export default function Layout({ children }) {
    return (
        <div className="pt-10">
            <div className="flex flex-col justify-center items-center h-full max-w-5xl mx-auto shadow-xl relative bg-white font-suit">
                { children }
            </div>
        </div>
    )
}