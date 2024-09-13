import express, { Request, Response } from "express";
import fs from "fs";
import cors from "cors";

const app = express();
app.use(cors()); 

app.get("/video", (req: Request, res: Response) => {
    const range = req.headers.range;

    if (!range) {
        res.status(400).send("Requires Range header");
        throw new Error("did no recieve and range")
    }
    console.log(req.headers)
    const videoPath = "./assets/sample.mp4"
    const videoSize = fs.statSync(videoPath).size;
    const CHUNK_SIZE = 10 ** 6;
    
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    const contentLength = end - start + 1;
    const header = {
        "Content-Range": `bytes  ${start} - ${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4"
    }

    res.writeHead(206,header);

    const videoStream = fs.createReadStream(videoPath,{start,end});
    videoStream.pipe(res);
})

app.listen(3000);