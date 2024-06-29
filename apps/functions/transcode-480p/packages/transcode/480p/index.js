const S3 = require('aws-sdk/clients/s3');
const fs = require('fs');
const path = require('path');
const Ffmpeg = require('fluent-ffmpeg');
const tar = require('tar');
const { promisify } = require('util');
const stream = require('stream');
const lzma = require('lzma-native');
const pipeline = promisify(stream.pipeline);

const s3 = new S3({
  s3ForcePathStyle: false,
  endpoint: 'https://nyc3.digitaloceanspaces.com',
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_ACCESS_KEY_SECRET,
  }
});

async function downloadFfmpeg(ffmpegKey, downloadPath) {
  // console.log('Downloading FFmpeg binary from S3...');
  const params = { Bucket: 'chillwave', Key: ffmpegKey };
  const ffmpegStream = s3.getObject(params).createReadStream();
  const writeStream = fs.createWriteStream(downloadPath);
  await pipeline(ffmpegStream, writeStream);
  console.log('🔃 FFmpeg binary downloaded.');
}

async function decompressFfmpeg(archivePath, decompressedPath) {
  // console.log('Decompressing FFmpeg binary...');
  return new Promise((resolve, reject) => {
    const input = fs.createReadStream(archivePath);
    const decompressor = lzma.createDecompressor();
    const output = fs.createWriteStream(decompressedPath);

    input.pipe(decompressor).pipe(output)
      .on('finish', () => {
        console.log('🗜 Decompression completed.');
        resolve();
      })
      .on('error', reject);
  });
}

async function extractFfmpeg(decompressedPath, extractPath) {
  // console.log('Extracting FFmpeg tar file...');
  return new Promise((resolve, reject) => {
    tar.x({
        file: decompressedPath,
        C: extractPath
    }).then( () => {
        console.log('👾 Extracting FFmpeg tar file completed.');
        resolve();
    }).catch((err) => {
        reject(err);
    });
  }) 
}

async function setExecutablePermissions(filePath) {
  console.log(`💥 Setting executable permissions for ${filePath}...`);
  fs.chmodSync(filePath, '755');
}

async function transcodeVideoStream(readStream, id, tempDir) {
    return new Promise((resolve, reject) => {
      Ffmpeg(readStream)
        .on('start', commandLine => {
          console.log(`🌟 Transcoding ${id} to 480p`);
          console.log('Spawned Ffmpeg with command: ' + commandLine);
        })
        .on('error', (err, stdout, stderr) => {
          console.log('stderr:', stderr);
          console.error('Error during transcoding:', err);
          reject({
            statusCode: 400,
            body: {
              status: "FAILED",
              message: err.message,
            }
          });
        })
        .on('end', async () => {
          try {
            const fileUploadPromises = fs.readdirSync(`/tmp/${id}`).map(file => {
              let params = { 
                Bucket: 'chillwave-video-egress', 
                Key: `${id}/${file}`, 
                Body: fs.readFileSync(`/tmp/${id}/${file}`) 
              };
              console.log(`⛅ Uploading ${file} to s3`);
              return s3.putObject(params).promise();
            });
        
            await Promise.all(fileUploadPromises); // upload output to s3
        
            await fs.promises.rmdir(`/tmp/${id}`, { recursive: true });
            console.log(`🚮 Temporary files deleted.`);
        
            resolve({
              statusCode: 200,
              body: {
                status: "SUCCESS",
                message: 'Transcoding to 360p complete',
              }
            });
          } catch (error) {
            console.error(`Error during transcoding and upload: ${error.message}`);
            reject({
              statusCode: 500,
              body: {
                status: "FAILURE",
                message: 'An error occurred during transcoding or upload',
              }
            });
          }
        })
        .outputOptions([
          '-loglevel quiet',
          '-preset veryfast',
          '-vf scale=w=842:h=480', 
          '-c:a aac', 
          '-ar 48000', 
          '-b:a 128k', 
          '-c:v libx264', 
          '-profile:v main', 
          '-crf 25', 
          '-g 48', 
          '-keyint_min 48', 
          '-sc_threshold 0', 
          '-b:v 1400k', 
          '-maxrate 1498k', 
          '-bufsize 2100k', 
          '-f hls', 
          '-hls_time 4', 
          '-hls_playlist_type vod', 
          `-hls_segment_filename /tmp/${id}/480p_%d.ts`,
          '-tune fastdecode',
          '-threads 6'
        ])
        .output(`/tmp/${id}/480p.m3u8`) // output files are temporarily stored in tmp directory
        .run();
    });
}

exports.main = async (args) => {
  const id = args.jobId;
  const ffmpegKey = 'ffmpeg/ffmpeg-release-amd64-static.tar.xz'; // Update with your actual ffmpeg tar.xz key
  const ffmpegArchivePath = '/tmp/ffmpeg.tar.xz';
  const ffmpegDecompressedPath = '/tmp/ffmpeg.tar';
  const ffmpegExtractPath = '/tmp/ffmpeg';

  if (!process.env.S3_ACCESS_KEY_ID || !process.env.S3_ACCESS_KEY_SECRET || !process.env.S3_REGION) {
    console.error('Missing required environment variables');
    throw new Error("Environment variables not configured");
  }

  console.log('🎬 Received Job Id:', id);

  const tempDir = `/tmp/${id}`;
  const inputParams = { Bucket: 'chillwave-video-intake', Key: id };

  try {
    // Ensure the ffmpeg binary is available
    if (!fs.existsSync(path.join(ffmpegExtractPath, 'ffmpeg'))) {
      fs.mkdirSync(ffmpegExtractPath, { recursive: true });
      await downloadFfmpeg(ffmpegKey, ffmpegArchivePath);
      await decompressFfmpeg(ffmpegArchivePath, ffmpegDecompressedPath);
      await extractFfmpeg(ffmpegDecompressedPath, ffmpegExtractPath);

      console.log('📺 FFmpeg 7.0.1 AMD64 ready');
    }

    const ffmpegPath = path.join(ffmpegExtractPath,'ffmpeg-7.0.1-amd64-static', 'ffmpeg');
    const ffprobePath = path.join(ffmpegExtractPath, 'ffmpeg-7.0.1-amd64-static', 'ffprobe');

    if (!fs.existsSync(ffmpegPath)) {
      throw new Error(`FFmpeg binary not found at ${ffmpegPath}`);
    }

    if (!fs.existsSync(ffprobePath)) {
      throw new Error(`FFprobe binary not found at ${ffprobePath}`);
    }

    // Set executable permissions
    await setExecutablePermissions(ffmpegPath);
    await setExecutablePermissions(ffprobePath);

    // Configure fluent-ffmpeg to use the downloaded binaries
    Ffmpeg.setFfmpegPath(ffmpegPath);
    Ffmpeg.setFfprobePath(ffprobePath);

    fs.mkdirSync(tempDir);

    const readStream = s3.getObject(inputParams).createReadStream(); // create S3 readStream

    const transcode = await transcodeVideoStream(readStream, id, tempDir);
    return transcode;

  } catch (error) {
    console.error('An error occurred:', error.message);
    return ({
      statusCode: 400,
      body: {
        status: "FAILED",
        message: error.message,
      }
    })
  } finally {
    // Clean up temporary files
    if (fs.existsSync(tempDir)) {
      fs.rmdirSync(tempDir, { recursive: true });
      console.log('🚮 Temporary files deleted.');
    }
  }
}
