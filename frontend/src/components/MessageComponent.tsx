export function MessageComponent({ sender, message }: {
    sender: string,
    message: string
}) {
    return (
        <div className="w-full min-h-[6vh] flex flex-col ">
            <span className="font-semibold text-base">
                {sender} :
            </span>
            <div className="text-sm font-thin ml-2 w-max-full">
                {message}
            </div>
        </div>
    )
}