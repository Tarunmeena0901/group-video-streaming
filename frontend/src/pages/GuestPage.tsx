import { useEffect, useRef, useState } from "react";
import { useWebSocket } from "../providers/webSocketProvider";
import { useUser } from "../providers/userProvider";

type MessageProps = {
    sender: string,
    message: string
}

export function GuestPage() {
    const videoElementRef = useRef<HTMLVideoElement>(null);
    const mediaSource = useRef(new MediaSource());
    const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
    const [receivedMessages, setReceivedMessages] = useState<MessageProps[]>([])
    const [message, setMessage] = useState<string>('');
    const { userName, roomId } = useUser();

    const ws = useWebSocket();

    if (!ws) {
        throw new Error("unable to connect to server");
    }

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
        if (!videoElementRef.current) {
            throw new Error("video element not found");
        }

        const videoElement = videoElementRef.current;

        mediaSource.current = new MediaSource();
        videoElement.src = URL.createObjectURL(mediaSource.current);

        mediaSource.current.addEventListener("error", (e) => {
            console.error("MediaSource error:", e);
        });

        mediaSource.current.addEventListener("sourceopen", () => {

            const sourceBuffer = mediaSource.current.addSourceBuffer(`video/mp4; codecs="avc1.42E01E,mp4a.40.2"`);

            sourceBuffer.addEventListener('error', (e) => {
                console.error("SourceBuffer error:", e);
            });

            ws.onmessage = async (event) => {
                const parsedData = JSON.parse(event.data);
                if (parsedData.type == "VIDEO_BUFFER") {
                    try {
                        const buffer = await parsedData.videoData.arrayBuffer();
                        console.log(mediaSource.current.sourceBuffers);
                        console.log("Received buffer:", buffer);

                        if (!sourceBuffer.updating) {
                            sourceBuffer.appendBuffer(buffer);
                            if (!hasStartedPlaying) {
                                videoElement.play();
                                setHasStartedPlaying(true); // Ensure play is called only once
                                console.log("Started playing video");
                            }
                        } else {
                            sourceBuffer.onupdateend = () => {
                                mediaSource.current.endOfStream();
                                alert("stream ended")
                            };
                        }
                    } catch (e) {
                        console.error("Error handling WebSocket message:", e);
                    }
                }

                if (parsedData.type == "MESSAGE") {
                    console.log(parsedData)
                    const message = {
                        sender: parsedData.sender,
                        message: parsedData.message
                    }
                    setReceivedMessages((prev) => [...prev, message])
                    console.log(receivedMessages);
                }
            };
        });

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        return () => {
            if (mediaSource.current.readyState === 'open') {
                mediaSource.current.endOfStream();
            }
            ws.send(JSON.stringify({ type: "LEAVE_ROOM", userName }));
            ws.close();
        };
    }, []);


    return (
        <div className="h-screen flex flex-col justify-center gap-6 text-white">
            <div className="flex gap-6">
                <div className="w-4/5 h-[80vh] ">
                    <video ref={videoElementRef} autoPlay controls muted className="w-full h-full rounded-lg" />
                </div>
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
                                    className="w-full h-full rounded-lg py-2 px-3 text-black flex justify-center items-center"
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>
                            <div className="w-full h-1/2 ">
                                <button
                                    onClick={handleSendMessage}
                                    className="w-full h-full rounded-lg bg-neutral-900 flex justify-center items-center border-2 border-dashed border-white hover:bg-neutral-800 hover:border-solid transition ease-in-out ">
                                    Send Message
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function MessageComponent({ sender, message }: {
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