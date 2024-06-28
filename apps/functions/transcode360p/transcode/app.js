const AWS = require('aws-sdk');
const S3 = require('aws-sdk/clients/s3');
const Ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const { spawn } = require('child_process');
const { resolve } = require('path');

async function constructS3Connection(){
  try {
    const ssm = new AWS.SSM(); // Instantiate the SSM client

    let SPACES_ACCESS_KEY_ID = await ssm.getParameter({ Name: '/digitalocean/spaces/access_key', WithDecryption: true }).promise();
    let SPACES_ACCESS_KEY_SECRET = await ssm.getParameter({ Name: '/digitalocean/spaces/access_key_secret', WithDecryption: true }).promise();

    let connection = new S3({
      s3ForcePathStyle: false,
      endpoint: 'https://nyc3.digitaloceanspaces.com',
      region: "us-east-1",
      credentials: {
        accessKeyId: SPACES_ACCESS_KEY_ID.Parameter.Value,
        secretAccessKey: SPACES_ACCESS_KEY_SECRET.Parameter.Value,
      },
      httpOptions: {
        connectTimeout: parseInt(900000),
        timeout: parseInt(900000), // Set the timeout to 15 minutes (900000 milliseconds)
      },
    });

    console.info('✅ Digital Ocean S3 connected');
    return connection;
  } catch (err) {
    console.error('⛔ Error configuring Digital Ocean connection:', err);
    throw {
      statusCode: 500,
      body: JSON.stringify({
        error: err,
        message: 'Error configuring Digital Ocean connection'
      })
    };
  }
}

exports.lambdaHandler = async (event, context) => {
  try {
    const s3 = await constructS3Connection();
    const id = event.jobId;
    const filePath = context.awsRequestId;

    console.info('🎬 Received Job Id:', id);

    const inputParams = { Bucket: 'chillwave-video-intake', Key: id };
    const readStream = s3.getObject(inputParams).createReadStream();

    fs.mkdirSync(`/tmp/${filePath}`);

    const transcode = await new Promise((resolve, reject) => {
      Ffmpeg(readStream)
        .on('start', commandLine => {
          console.log(`🌟 Transcoding ${id} to 360p`);
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
            const fileUploadPromises = fs.readdirSync(`/tmp/${filePath}`).map(file => {
              let params = { 
                Bucket: 'chillwave-video-egress', 
                Key: `${filePath}/${file}`, 
                Body: fs.readFileSync(`/tmp/${filePath}/${file}`) 
              };
              console.log(`⛅ Uploading ${file} to s3`);
              return s3.putObject(params).promise();
            });
        
            await Promise.all(fileUploadPromises); // upload output to s3
        
            await fs.promises.rmdir(`/tmp/${filePath}`, { recursive: true });
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
          '-preset ultrafast',
          '-vf scale=w=640:h=360', 
          '-c:a aac', 
          '-ar 48000', 
          '-b:a 96k', 
          '-c:v h264', 
          '-profile:v main', 
          '-crf 22', 
          '-g 48', 
          '-keyint_min 48', 
          '-sc_threshold 0', 
          '-b:v 800k', 
          '-maxrate 856k', 
          '-bufsize 1200k', 
          '-f hls', 
          '-hls_time 4', 
          '-hls_playlist_type vod', 
          `-hls_segment_filename /tmp/${filePath}/360p_%d.ts`,
          '-tune fastdecode',
          '-threads 6'
        ])
        .output(`/tmp/${filePath}/360p.m3u8`) // output files are temporarily stored in tmp directory
        .run();
    })

    return transcode;

  } catch (error) {
    console.error('An error occurred:', error.message);
    return ({
      statusCode: 400,
      body: {
        status: "FAILED",
        message: error.message,
      }
    });
  }
};
