export default function Container({ title, description, text_css="px-16 space-y-4" }) {
    return (
        <div className="px-2 text-center mb-8">
            {title && (<div className="my-12 flex justify-center">
                <p className="tracking-wider px-4 text-2xl font-ongle">{ title }</p>
            </div>)}
            <div className={`text-gray-400 leading-7 ${text_css}`}>
                {description && description.map((n, i) => (
                    n?.length > 0 ? (
                        <p key={`description-${i}`}>{n}</p>
                    ) : (
                        <br key={`br-${i}`} />
                    )
                ))}
            </div>
        </div>
    )
}