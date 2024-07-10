import { Readable } from "stream";
import { Constants } from "../constants/queue.constants";
import { promises as fs } from 'fs';
import { spawn } from "child_process";
import AWS from "aws-sdk";

export async function transcodeVideo(videoBuffer : Buffer, id: string, showLogs: boolean) : Promise<string>
{
    return new Promise(async (resolve, reject) => {
        const outputPath = `/tmp/${id}`;
        const commands = await buildCommands(outputPath);
        const masterPlaylist = await writePlaylist(outputPath, id);

        const s3Params = { Bucket: 'chillwave-video-intake', Key: id };
        const s3 = new AWS.S3({
            s3ForcePathStyle: false,
            endpoint: process.env.S3_ENDPOINT,
            region: process.env.S3_REGION,
            credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_ACCESS_KEY_SECRET,
            }
        });

        const ffmpeg = spawn('ffmpeg', commands, {
            stdio: ['pipe', 'pipe', 'pipe'],
        });

        ffmpeg.stdout.on('data', (data: any) =>  {
            if (showLogs){
              console.log(data.toString());
            }
        });

        ffmpeg.stderr.on('data', (data: any) =>  {
            if (showLogs){
              console.log(data.toString());
            }
        });

        ffmpeg.on('exit', async (code: any) =>  {
            if (showLogs){
              console.log(`Child exited with code ${code}`);
            }

            if (code == 0){

                await updatePlaylistWithCDN(outputPath, id);
                await fileUploadPromises(s3, outputPath, id);
                await deleteSourceFile(s3, s3Params)

                return resolve('Video Successfully Uploaded');
            }
  
            return reject('Video Failed to Transcode');
            
        })

        // pipe in read stream as input
        ffmpeg.stdin.write(videoBuffer);
        ffmpeg.stdin.end();
    });
}

async function buildCommands(outputPath : string) : Promise<string[]>{
    return new Promise((resolve, reject) => {
        let commands = ['-hide_banner', '-y', '-i', '-']; //input will be piped in from readstream
        const renditions = Constants.VIDEO_RENDITIONS;

        for (let i = 0, len = renditions.length; i < len; i++){
            const r = renditions[i];
            commands = commands.concat([
                '-vf', `scale=w=${r.width}:h=${r.height}:force_original_aspect_ratio=decrease`, 
                '-c:a', 'aac', 
                '-ar', '48000', 
                '-c:v', 'h264', 
                `-profile:v`, r.profile, 
                '-crf', '20', 
                '-sc_threshold', '0', 
                '-g', '48', 
                '-hls_time', r.hlsTime, 
                '-hls_playlist_type', 'vod', 
                '-b:v', r.bv, 
                '-maxrate', r.maxrate, 
                '-bufsize', r.bufsize, 
                '-b:a', r.ba, 
                '-hls_segment_filename', `${outputPath}/${r.ts_title}_%03d.ts`, 
                `${outputPath}/${r.height}.m3u8`
            ]);
        }
        
        resolve(commands);
    });
}

async function writePlaylist(outputPath : string, id: string) : Promise<string> {
    return new Promise(async (resolve, reject) => {
        let m3u8Playlist =  `#EXTM3U
#EXT-X-VERSION:3`;
        const renditions = Constants.VIDEO_RENDITIONS;
        
        for (let i = 0, len = renditions.length; i < len; i++){
          const r = renditions[i];
          m3u8Playlist += `
#EXT-X-STREAM-INF:BANDWIDTH=${r.bv.replace('k', '000')},RESOLUTION=${r.width}x${r.height}
${Constants.VIDEO_CDN_PREFIX}${id}/${r.height}.m3u8`
        }
        const m3u8Path = `${outputPath}/index.m3u8`
        await fs.writeFile(m3u8Path, m3u8Playlist);

        resolve(m3u8Path);
    });
}

async function updatePlaylistWithCDN(outputPath: string, id: string) : Promise<void> {
    const renditions = Constants.VIDEO_RENDITIONS;

    for (let i = 0, len = renditions.length; i < len; i++) {
        const r = renditions[i];
        const playlistPath = `${outputPath}/${r.height}.m3u8`;
        let playlistContent = await fs.readFile(playlistPath, 'utf8');
        playlistContent = playlistContent.replace(/(\d+_%03d\.ts)/g, `${Constants.VIDEO_CDN_PREFIX}/${id}/$1`);
        await fs.writeFile(playlistPath, playlistContent);
    }
}

async function fileUploadPromises(s3: AWS.S3, outputPath: string, id: string){
    try {
        const files = await fs.readdir(outputPath);
        
        return Promise.all(files.map(async (file) => {
            const filePath = `${outputPath}/${file}`;
            const fileContent = await fs.readFile(filePath);
        
            const params = { 
                Bucket: 'chillwave-video-egress', 
                Key: `${id}/${file}`, 
                Body: fileContent,
                ACL: 'public-read',
                CacheControl: 'max-age=31536000',
            };
        
            console.log(`⛅ Uploading ${file} to s3`);
            return s3.putObject(params).promise();
        }));
    } catch (error) {
        console.error('Error during file upload:', error);
        throw error;
    }
};

async function deleteSourceFile(s3: AWS.S3, s3Params: AWS.S3.GetObjectRequest) {
    return new Promise((resolve, reject) => {
        s3.deleteObject(s3Params, (err, data) => {
            if (err) {
                console.error('Error deleting source file from S3:', err);
                return reject('Error deleting source file from S3');
            }
            console.log('Source file successfully deleted from S3');
            resolve(data);
        });
    });
}