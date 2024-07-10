export abstract class Constants {
    static readonly VIDEO_CDN_PREFIX = "https://chillwave-video-egress.nyc3.cdn.digitaloceanspaces.com/";
    static readonly VIDEO_RENDITIONS = [
        {
            // 360p video rendition
            width: 640,
            height: 360,
            profile: 'main',
            hlsTime: '4',
            bv: '800k',
            maxrate: '856k',
            bufsize: '1200k',
            ba: '96k',
            ts_title: '360p',
            master_title: '360p'
        },
        {
            // 480p video rendition
            width: 842,
            height: 480,
            profile: 'main',
            hlsTime: '4',
            bv: '1400k',
            maxrate: '1498',
            bufsize: '2100k',
            ba: '128k',
            ts_title: '480p',
            master_title: '480p'
        },
        {
            // 720p video rendition
            width: 1280,
            height: 720,
            profile: 'main',
            hlsTime: '4',
            bv: '2800k',
            maxrate: '2996k',
            bufsize: '4200k',
            ba: '128k',
            ts_title: '720p',
            master_title: '720p' 
        },
        {
            // 1080p video rendition
            width: 1920,
            height: 1080,
            profile: 'main',
            hlsTime: '4',
            bv: '5000k',
            maxrate: '5350k',
            bufsize: '7500k',
            ba: '192k',
            ts_title: '1080p',
            master_title: '1080p'
        }
    ];
}