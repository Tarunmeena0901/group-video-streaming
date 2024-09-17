import { useEffect, useRef, useState } from "react";
import { useWebSocket } from "../providers/webSocketProvider";
import { useUser } from "../providers/userProvider";
import { ChatBox } from "../components/ChatBox";
import { useNavigate } from "react-router-dom";
import { FaRunning } from "react-icons/fa";

type MessageProps = {
    sender: string,
    message: string
}

export function GuestPage() {
    const videoElementRef = useRef<HTMLVideoElement>(null);
    const mediaSource = useRef(new MediaSource());
    const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
    const [receivedMessages, setReceivedMessages] = useState<MessageProps[]>([])
    const { userName, roomId } = useUser();

    const ws = useWebSocket();
    const navigate = useNavigate();

    if (!ws) {
        throw new Error("unable to connect to server");
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
                    console.log(parsedData.type);
                    try {
                        const base64Data = parsedData.videoData;
                        const binaryData = atob(base64Data);
                        const len = binaryData.length;
                        const buffer = new Uint8Array(len);

                        for (let i = 0; i < len; i++) {
                            buffer[i] = binaryData.charCodeAt(i);
                        }

                        console.log(mediaSource.current.sourceBuffers);
                        console.log("Received buffer:", buffer);

                        if (!sourceBuffer.updating) {
                            console.log("appending buffer")
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
                    const message = {
                        sender: parsedData.sender,
                        message: parsedData.message
                    }
                    console.log(message);
                    setReceivedMessages((prev) => [...prev, message])
                }
            };
        });

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        return () => {
            console.log("Cleaning up")
            if (mediaSource.current.readyState === 'open') {
                mediaSource.current.endOfStream();
            }
        };
    }, []);

    const handleUserLeave =  () => {
        const data = {
            type: "LEAVE_ROOM",
            userName: userName
        }
        ws.send(JSON.stringify(data));
        navigate("/");
    }

    return (
        <div className="h-screen flex flex-col justify-center gap-2 text-white">
            <div className="flex gap-6">
                <div className="w-4/5 h-[80vh] ">
                    <video ref={videoElementRef} autoPlay controls muted className="w-full h-full rounded-lg" />
                </div>
                <ChatBox userName={userName} roomId={roomId} receivedMessages={receivedMessages} />
            </div>
            <div className="w-4/5 flex justify-center py-2">
                <button
                    className="w-[25vh] group h-full rounded-lg py-2 px-3 text-white flex justify-center items-center gap-2 border-2 border-neutral-700 hover:border-white"
                    onClick={handleUserLeave}
                >
                    <span className="text-red-500">Leave Room</span>
                    <FaRunning className="text-2xl mt-1 text-neutral-700 group-hover:text-white" />
                </button>
            </div>
        </div>
    )
}

