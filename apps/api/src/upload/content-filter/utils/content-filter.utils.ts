import * as ffmpeg from 'fluent-ffmpeg';

export async function extractFramesFromVideo(videoPath: string, samplingRate: number = 1): Promise<Buffer[]> {
  const frames: Buffer[] = [];

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions([
        '-vf fps=1/' + samplingRate,
        '-f image2pipe',
        '-vcodec rawvideo',
        '-pix_fmt rgb24',
      ])
      .on('error', (err) => {
        reject(err);
      })
      .on('data', (chunk) => {
        frames.push(chunk);
      })
      .on('end', () => {
        resolve(frames);
      })
      .run();
  });
}