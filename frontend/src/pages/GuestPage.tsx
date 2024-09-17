import { useEffect, useRef, useState } from "react";
import { useWebSocket } from "../providers/webSocketProvider";
import { useUser } from "../providers/userProvider";
import { ChatBox } from "../components/ChatBox";


export function GuestPage() {
    const videoElementRef = useRef<HTMLVideoElement>(null);
    const mediaSource = useRef(new MediaSource());
    const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
    const { userName, roomId } = useUser();

    const ws = useWebSocket();

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
        };
    }, []);


    return (
        <div className="h-screen flex flex-col justify-center gap-6 text-white">
            <div className="flex gap-6">
                <div className="w-4/5 h-[80vh] ">
                    <video ref={videoElementRef} autoPlay controls muted className="w-full h-full rounded-lg" />
                </div>
                <ChatBox ws={ws} userName={userName} roomId={roomId} />
            </div>
        </div>
    )
}

