import { ObjectCannedACL } from "@aws-sdk/client-s3"
import { PassThrough } from "stream";

export class S3FileUpload {
    readonly file: Buffer | PassThrough;
    readonly bucketName: string;
    readonly objectKey: string;
    readonly filePath?: string;
    readonly contentType?: string;
    readonly acl?: ObjectCannedACL;
    readonly cacheControl?: string;
}