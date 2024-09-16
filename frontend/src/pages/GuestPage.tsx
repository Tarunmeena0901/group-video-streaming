import { useEffect, useRef, useState } from "react";
import { useWebSocket } from "../providers/webSocketProvider";
import { useUser } from "../providers/userProvider";

export function GuestPage() {
    const videoElementRef = useRef<HTMLVideoElement>(null);
    const mediaSource = useRef(new MediaSource());
    const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
    const { userName } = useUser();
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
                try {
                    const parsedData = JSON.parse(event.data);
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
            };
        });

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        return () => {
            if (mediaSource.current.readyState === 'open') {
                mediaSource.current.endOfStream();
            }
        };
    }, []);


    return (
        <div className="h-screen flex flex-col justify-center gap-6 text-white">
            <div className="w-full flex justify-center">
                <span className="text-2xl font-bold">
                    
                </span>
            </div>
            <div className="flex gap-6">
                <div className="w-4/5 h-[80vh] ">
                    <video ref={videoElementRef} autoPlay controls muted className="w-full h-full rounded-lg" />
                </div>
                <div className="w-1/5 h-full">
                    <div className="flex flex-col gap-2 h-full w-full">
                        <div className="w-full h-[90%] p-4 flex flex-col border-2 border-neutral-700 bg-neutral-900 rounded-lg">
                                messages
                        </div>
                        <div className="w-full h-[10%] p-2">
                            <input 
                            placeholder="write message here" 
                            type="text" 
                            className="w-full h-full rounded-lg p-2 flex items-center"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}