import { useEffect, useRef, useState } from "react";

export function GuestPage() {
    const videoElementRef = useRef<HTMLVideoElement>(null);
    const mediaSource = useRef(new MediaSource());
    const [hasStartedPlaying, setHasStartedPlaying] = useState(false); 

    useEffect(() => {
        if (!videoElementRef.current) {
            throw new Error("video element not found");
        }
    
        const videoElement = videoElementRef.current;
    
        // Initialize the mediaSource and set the video src
        mediaSource.current = new MediaSource();
        videoElement.src = URL.createObjectURL(mediaSource.current );
        console.log(videoElement.src);
        const ws = new WebSocket("ws://localhost:8080"); // Use the correct WebSocket protocol
    
        // Add error handling for MediaSource and SourceBuffer
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
                    const buffer = await event.data.arrayBuffer();
                    console.log(mediaSource.current.sourceBuffers);
                    console.log("Received buffer:", buffer);
    
                    if (!sourceBuffer.updating) {
                        console.log("appended")
                        sourceBuffer.appendBuffer(buffer);
                        if (!hasStartedPlaying) {
                            videoElement.play();
                            setHasStartedPlaying(true); // Ensure play is called only once
                            console.log("Started playing video");
                        }
                    } else {
                        sourceBuffer.onupdateend = () => {
                            mediaSource.current.endOfStream();
                            console.log("stream ended")
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
            // Cleanup WebSocket and MediaSource
            ws.close();
            if (mediaSource.current.readyState === 'open') {
                mediaSource.current.endOfStream();
            }
        };
    }, []);


    return (
        <div className="h-screen flex justify-center items-center">
            <div className="flex flex-col items-center gap-4 w-[90vh] h-[70vh] ">
                <video ref={videoElementRef} autoPlay controls muted className="w-full h-full" />
                
            </div>
        </div>
    )
}