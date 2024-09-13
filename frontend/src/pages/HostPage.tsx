import { useRef } from "react"

export function HostPage() {
    const videoPlayerRef = useRef<HTMLVideoElement & { captureStream: () => MediaStream }>(null);
    const ws = useRef<WebSocket>();

    const handleVideoLoad = (file: any) => {
        const videoElement = videoPlayerRef.current;
        ws.current = new WebSocket("http://localhost:8080");
        if (videoElement) {
            videoElement.src = URL.createObjectURL(file);
        } else {
            throw new Error("video element not found");
        }
        videoElement.onloadeddata = ()=> {
            videoElement.play();

            const stream = videoElement.captureStream()

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm; codecs=vp8'
            })

            mediaRecorder.ondataavailable = (event: BlobEvent) => {
                if(event.data.size > 0){
                    ws.current?.send(event.data);
                }
            }

            mediaRecorder.start(500);
        }
    }

    return (
        <div className="h-screen flex justify-center items-center">
            <div className="flex flex-col items-center gap-4 w-[90vh] h-[70vh] ">
                <input type="file" accept="video/*" onChange={(e) => handleVideoLoad(e.target.value)} />
                <video id="video" ref={videoPlayerRef} controls className="w-full h-full" />
            </div>
        </div>
    )
}