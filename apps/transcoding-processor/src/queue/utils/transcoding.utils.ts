import { Constants } from '../constants/queue.constants';
import { promises as fs } from 'fs';
import { spawn } from 'child_process';
import { S3ClientService } from 'src/s3-client/s3-client.service';
import { S3FileUpload } from 'src/s3-client/dto/s3-file-upload.dto';

export async function transcodeVideo(
  s3Client: S3ClientService,
  id: string,
  showLogs: boolean,
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const outputPath = `/tmp/${id}`;
    const commands = await buildCommands(outputPath);

    await writePlaylist(outputPath, id);

    const ffmpeg = spawn('ffmpeg', commands, {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    ffmpeg.stdout.on('data', (data: any) => {
      if (showLogs) {
        console.log(data.toString());
      }
    });

    ffmpeg.stderr.on('data', (data: any) => {
      if (showLogs) {
        console.log(data.toString());
      }
    });

    ffmpeg.on('exit', async (code: any) => {
      if (showLogs) {
        console.log(`Child exited with code ${code}`);
      }

      if (code == 0) {
        await updatePlaylistWithCDN(outputPath, id);
        await fileUploadPromises(s3Client, outputPath, id);
        await s3Client.deleteFile('chillwave-video-intake', id);

        return resolve('Video Successfully Uploaded');
      }

      return reject('Video Failed to Transcode');
    });

    // pipe in read stream as input
    const videoStream = await s3Client.getVideoStream(
      'chillwave-video-intake',
      id,
    );
    videoStream.pipe(ffmpeg.stdin);

    videoStream.on('end', () => {
      ffmpeg.stdin.end();
    });
  });
}

async function buildCommands(outputPath: string): Promise<string[]> {
  return new Promise((resolve) => {
    let commands = ['-hide_banner', '-y', '-i', '-']; //input will be piped in from readstream
    const renditions = Constants.VIDEO_RENDITIONS;

    for (let i = 0, len = renditions.length; i < len; i++) {
      const r = renditions[i];
      commands = commands.concat([
        '-vf',
        `scale=w=${r.width}:h=${r.height}:force_original_aspect_ratio=decrease`,
        '-c:a',
        'aac',
        '-ar',
        '48000',
        '-c:v',
        'h264',
        `-profile:v`,
        r.profile,
        '-crf',
        '20',
        '-sc_threshold',
        '0',
        '-g',
        '48',
        '-hls_time',
        r.hlsTime,
        '-hls_playlist_type',
        'vod',
        '-b:v',
        r.bv,
        '-maxrate',
        r.maxrate,
        '-bufsize',
        r.bufsize,
        '-b:a',
        r.ba,
        '-hls_segment_filename',
        `${outputPath}/${r.ts_title}_%03d.ts`,
        `${outputPath}/${r.height}.m3u8`,
      ]);
    }

    resolve(commands);
  });
}

async function writePlaylist(outputPath: string, id: string): Promise<string> {
  return new Promise(async (resolve) => {
    let m3u8Playlist = `#EXTM3U
#EXT-X-VERSION:3`;
    const renditions = Constants.VIDEO_RENDITIONS;

    for (let i = 0, len = renditions.length; i < len; i++) {
      const r = renditions[i];
      m3u8Playlist += `
#EXT-X-STREAM-INF:BANDWIDTH=${r.bv.replace('k', '000')},RESOLUTION=${r.width}x${
        r.height
      }
${Constants.VIDEO_CDN_PREFIX}${id}/${r.height}.m3u8`;
    }
    const m3u8Path = `${outputPath}/index.m3u8`;
    await fs.writeFile(m3u8Path, m3u8Playlist);

    resolve(m3u8Path);
  });
}

async function updatePlaylistWithCDN(
  outputPath: string,
  id: string,
): Promise<void> {
  const renditions = Constants.VIDEO_RENDITIONS;

  for (let i = 0, len = renditions.length; i < len; i++) {
    const r = renditions[i];
    const playlistPath = `${outputPath}/${r.height}.m3u8`;
    let playlistContent = await fs.readFile(playlistPath, 'utf8');
    playlistContent = playlistContent.replace(
      /(\d+_%03d\.ts)/g,
      `${Constants.VIDEO_CDN_PREFIX}/${id}/$1`,
    );
    await fs.writeFile(playlistPath, playlistContent);
  }
}

async function fileUploadPromises(
  s3Client: S3ClientService,
  outputPath: string,
  id: string,
) {
  try {
    const files = await fs.readdir(outputPath);

    return Promise.all(
      files.map(async (file) => {
        const filePath = `${outputPath}/${file}`;
        const fileContent = await fs.readFile(filePath);

        const params: S3FileUpload = {
          bucketName: 'chillwave-video-egress',
          objectKey: `${file}`,
          filePath: `${id}`,
          file: fileContent,
          acl: 'public-read',
          cacheControl: 'max-age=31536000',
        };

        console.log(`⛅ Uploading ${file} to s3`);

        const upload = await s3Client.uploadFile(params);
        return upload;
      }),
    );
  } catch (error) {
    console.error('Error during file upload:', error);
    throw error;
  }
}
