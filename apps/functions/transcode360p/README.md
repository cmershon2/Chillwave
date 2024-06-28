![Chillwave Header](https://github.com/cmershon2/Chillwave/blob/main/docs/Chillwave-Headers.png?raw=true)
# 360p Transcoding Lambda Function
This AWS Lambda function is designed to transcode videos to a HLS playlist in 360p using FFmpeg with JavaScript. It takes an input video file and outputs an HLS playlist along with the necessary segments.
## Features
- Transcodes video to HLS format in 360p resolution.
- Utilizes up to 6 CPU cores for faster processing.
- Outputs a HLS playlist and segment files.
- Configurable FFmpeg settings for optimization.
## Requirements
- AWS Lambda environment.
- FFmpeg Layer installed and available in the Lambda runtime.
- Node.js for JavaScript execution.