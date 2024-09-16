import { useRef } from "react"

export function HostPage() {
    const videoPlayerRef = useRef<HTMLVideoElement & { captureStream: () => MediaStream }>(null);
    const ws = useRef<WebSocket>();
    const roomId = 1234
    const handleVideoLoad = (files: any) => {

        console.log("file uploading");
        const videoElement = videoPlayerRef.current;
        ws.current = new WebSocket("ws://localhost:8080");
        if (videoElement) {
            videoElement.src = URL.createObjectURL(files[0]);
        } else {
            throw new Error("video element not found");
        }
        videoElement.onloadeddata = ()=> {
            videoElement.play();

            const stream = videoElement.captureStream()

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType:`video/mp4; codecs="avc1.42E01E,mp4a.40.2"`,
                audioBitsPerSecond: 128000,
                videoBitsPerSecond: 2500000
            })

            mediaRecorder.ondataavailable = (event: BlobEvent) => {
                if(event.data.size > 0){
                    ws.current?.send(JSON.stringify({type: "VIDEO_BUFFER" ,videoData: event.data, roomId: roomId}));
                }
            }

            mediaRecorder.start(1000);
        }
    }

    return (
        <div className="h-screen flex justify-center items-center">
            <div className="flex flex-col items-center gap-4 w-[90vh] h-[70vh] ">
                <input type="file" accept="video/*" onChange={(e) => handleVideoLoad(e.target.files)} />
                <video ref={videoPlayerRef} controls className="w-full h-full" />
            </div>
        </div>
    )
}