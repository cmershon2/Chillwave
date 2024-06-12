const S3 = require('aws-sdk/clients/s3');
const fs = require('fs');
const path = require('path');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const s3 = new S3({
  s3ForcePathStyle: false,
  endpoint: 'https://nyc3.digitaloceanspaces.com',
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_ACCESS_KEY_SECRET,
  }
});

exports.main = async (args) => {
  const id = args.jobId;

  if (!process.env.S3_ACCESS_KEY_ID || !process.env.S3_ACCESS_KEY_SECRET || !process.env.S3_REGION) {
    console.error('Missing required environment variables');
    return;
  }

  console.log('Received Job Id:', id);

  const tempDir = `/tmp/${id}`;
  const inputParams = { Bucket: 'chillwave-video-intake', Key: id };

  try {
    console.log('Initializing Transcoding...');
    
    fs.mkdirSync(tempDir);

    const readStream = s3.getObject(inputParams).createReadStream(); // create S3 readStream

    let totalTime;

    ffmpeg(readStream)
      .on('start', () => {
        console.log(`Transcoding ${id} to 360p`);
      })
      .on('codecData', data => {
        totalTime = parseInt(data.duration.replace(/:/g, ''));
        console.log(`Codec data: ${JSON.stringify(data)}`);
      })
      .on('progress', progress => {
        const time = parseInt(progress.timemark.replace(/:/g, ''));
        const percent = Math.ceil((time / totalTime) * 100);
        console.log(`Progress: ${percent}%`);
      })
      .on('stderr', stderrLine => {
        console.log('Stderr output:', stderrLine);
      })
      .on('error', (err, stdout, stderr) => {
        console.log('Stderr:', stderr);
        console.error('Error:', err.message);
      })
      .on('end', async (err, stdout, stderr) => {
        console.log('Transcoding finished.');
        try {
          const fileUploadPromises = fs.readdirSync(tempDir).map(file => {
            const fileStream = fs.createReadStream(path.join(tempDir, file));
            const params = {
              Bucket: 'chillwave-video-egress',
              Key: `${id}/${file}`,
              Body: fileStream
            };
            console.log(`Uploading ${file} to S3`);
            return s3.putObject(params).promise();
          });
          await Promise.all(fileUploadPromises); // upload output to S3
          console.log('All files uploaded to S3.');
        } catch (uploadError) {
          console.error('Error uploading files:', uploadError.message);
        } finally {
          console.log(stdout);
        }
      })
      .outputOptions([
        '-vf scale=w=640:h=360',
        '-c:a aac',
        '-ar 48000',
        '-b:a 96k',
        '-c:v h264',
        '-profile:v main',
        '-crf 20',
        '-g 48',
        '-keyint_min 48',
        '-sc_threshold 0',
        '-b:v 800k',
        '-maxrate 856k',
        '-bufsize 1200k',
        '-f hls',
        '-hls_time 4',
        '-hls_playlist_type vod',
        `-hls_segment_filename ${path.join(tempDir, '360p_%d.ts')}`
      ])
      .output(path.join(tempDir, '360p.m3u8')) // output files are temporarily stored in tmp directory
      .run();
  } catch (error) {
    console.error('An error occurred:', error.message);
  } finally {
    // Clean up temporary files
    if (fs.existsSync(tempDir)) {
      fs.rmdirSync(tempDir, { recursive: true });
      console.log('Temporary files deleted.');
    }
  }
}
