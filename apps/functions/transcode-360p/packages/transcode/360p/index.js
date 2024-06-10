const Boto3 = require('aws-sdk/clients/s3');
const FFmpeg = require('fluent-ffmpeg');

const s3 = new Boto3({
  endpoint: process.env.S3_ENDPOINT,
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_ACCESS_KEY_SECRET,
});

const BUCKET_NAME = 'chillwave';
const OUTPUT_PREFIX = 'transcoded/360p/';

exports.main = async (event, context) => {
  const { videoChunk, chunkIndex } = event.body;

  try {
    const outputKey = `${OUTPUT_PREFIX}chunk-${chunkIndex}.ts`;

    await new Promise((resolve, reject) => {
      FFmpeg({ source: Buffer.from(videoChunk, 'base64') })
        .outputOptions([
          '-c:v libx264',
          '-crf 23',
          '-preset veryfast',
          '-vf scale=-2:360',
          '-f mpegts',
          '-codec:v libx264',
          '-codec:a aac',
          '-hls_time 6', // Set the segment duration to 6 seconds
          '-hls_playlist_type vod',
        ])
        .output(Buffer.from(''))
        .on('error', reject)
        .on('end', resolve)
        .run();
    });

    await s3
      .upload({
        Bucket: BUCKET_NAME,
        Key: outputKey,
        Body: FFmpeg.output,
      })
      .promise();

    return { statusCode: 200 };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: error.toString() };
  }
};