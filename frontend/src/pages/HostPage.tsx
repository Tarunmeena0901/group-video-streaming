import { useEffect, useRef, useState } from "react"
import { useWebSocket } from "../providers/webSocketProvider";
import { useUser } from "../providers/userProvider";
import { ChatBox } from "../components/ChatBox";
import { GoTriangleRight } from "react-icons/go";

export function HostPage() {
    const videoPlayerRef = useRef<HTMLVideoElement & { captureStream: () => MediaStream }>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [videoFile, setVideoFile] = useState<File | null>(null);

    const ws = useWebSocket();
    const { userName, roomId } = useUser();
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    if (!ws) {
        throw new Error("unable to connect to server");
    }

    const handleVideoLoad = (files: any) => {
        if (files && files.length > 0) {
            setVideoFile(files[0]);
        }
    };

    const startStreaming = () => {
        const videoElement = videoPlayerRef.current;
        if (videoFile && videoElement) {
            videoElement.src = URL.createObjectURL(videoFile);

            videoElement.onloadeddata = () => {
                console.log("1111");
                const stream = videoElement.captureStream();
                streamRef.current = stream;

                const mediaRecorder = new MediaRecorder(stream, {
                    mimeType: `video/mp4; codecs="avc1.42E01E,mp4a.40.2"`,
                    audioBitsPerSecond: 128000,
                    videoBitsPerSecond: 2500000,
                });
                mediaRecorderRef.current = mediaRecorder;

                mediaRecorder.ondataavailable = (event: BlobEvent) => {
                    console.log(event.data);
                    if (event.data.size > 0) {
                        // Convert Blob to Base64
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const base64Data = reader.result as string;
                            const payload = {
                                type: "VIDEO_BUFFER",
                                videoData: base64Data,
                                roomId: roomId,
                                userName: userName
                            };
                            ws.send(JSON.stringify(payload));
                        };
                        reader.readAsDataURL(event.data);
                    }
                };

                videoElement.play();
                mediaRecorder.start(1000); // Send video data every second
                setIsStreaming(true);
            };
        } else {
            console.error("No video file selected or video element not found.");
        }
    };

    const stopStreaming = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
        setIsStreaming(false);
        console.log("streaming stop");
    }

    useEffect(() => {
        return () => {
            stopStreaming();
            ws.send(JSON.stringify({ type: "LEAVE_ROOM", userName }));
        }
    }, []);

    return (
        <div className="h-screen flex flex-col justify-center gap-2 text-white">
            <div className="flex gap-6">
                <div className="w-4/5 h-[80vh] ">
                    <video ref={videoPlayerRef} controls className="w-full h-full rounded-lg" />
                </div>
                <ChatBox ws={ws} userName={userName} roomId={roomId} />
            </div>
            <div className="w-4/5 flex justify-between px-5 gap-4">
                <input
                    type="file"
                    accept="video/*"
                    className="w-[35vh] h-full rounded-lg py-2 px-3 text-white flex justify-center items-center cursor-pointer"
                    onChange={(e) => handleVideoLoad(e.target.files)} />
                <button
                    className="w-[25vh] group h-full rounded-lg py-2 px-3 text-white flex justify-center items-center border-2 border-neutral-700 hover:border-white"
                    onClick={isStreaming ? () => stopStreaming() : () => startStreaming()}
                >
                    <span>{isStreaming ? "Stop Streaming" : "Start Streaming "}</span>
                    <GoTriangleRight className="text-2xl mt-1 text-neutral-700 group-hover:text-white" />
                </button>
            </div>
        </div>
    )
}
