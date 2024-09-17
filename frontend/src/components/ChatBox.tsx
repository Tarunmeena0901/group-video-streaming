import { useEffect, useState } from "react";
import { MessageComponent } from "./MessageComponent";
import { BsArrowRightCircle } from "react-icons/bs";

type MessageProps = {
    sender: string,
    message: string
}

export function ChatBox({ userName, roomId, ws }: {
    userName: string | null,
    roomId: string | null,
    ws: WebSocket
}) {

    const [receivedMessages, setReceivedMessages] = useState<MessageProps[]>([])
    const [message, setMessage] = useState<string>('');

    const handleSendMessage = () => {
        const data = {
            type: "MESSAGE",
            sender: userName,
            roomId: roomId,
            message: message
        }
        ws.send(JSON.stringify(data));
    }

    useEffect(() => {
        if (!ws) {
            throw new Error("Not connected to WebSocket server");
        }
        ws.onmessage = (event: MessageEvent) => {
            const parsedData = JSON.parse(event.data);
            if (parsedData.type == "MESSAGE") {
                const message = {
                    sender: parsedData.sender,
                    message: parsedData.message
                }
                setReceivedMessages((prev) => [...prev, message])
            }
        };
    }, []);

    return (
        <div className="w-1/5 h-full">
            <div className="flex flex-col gap-2 h-full w-full">
                <div className="w-full h-[65vh] p-2 flex flex-col gap-2 border-2 border-neutral-700 bg-neutral-900 rounded-lg overflow-y-auto ">
                    {receivedMessages.map((msg, i) => {
                        return (
                            <MessageComponent key={`msg-${i}`} sender={msg.sender} message={msg.message} />
                        )
                    })}
                </div>
                <div className="flex flex-col h-[15%] gap-2">
                    <div className="w-full h-1/2 ">
                        <input
                            placeholder="write message here"
                            type="text"
                            className="w-full h-full rounded-lg py-2 px-3 text-black flex justify-center items-center border-2 border-neutral-700"
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>
                    <div className="w-full h-1/2 ">
                        <button
                            onClick={handleSendMessage}
                            className="w-full h-full rounded-lg bg-neutral-900 gap-2 flex justify-center items-center border-2 border-dashed border-neutral-700 hover:bg-neutral-800 hover:border-solid transition ease-in-out ">
                            Send Message
                            <BsArrowRightCircle  className="text-lg mt-[1px]"/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}