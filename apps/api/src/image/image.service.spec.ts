import { Test, TestingModule } from '@nestjs/testing';
import * as AWS from 'aws-sdk';
import sharp from 'sharp';
import { ImageUploadService } from './image.service';

jest.mock('aws-sdk', () => {
  const S3 = {
    upload: jest.fn().mockReturnThis(),
    promise: jest.fn().mockResolvedValue({}),
  };
  return { S3: jest.fn(() => S3) };
});

jest.mock('sharp');
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('unique-id'),
}));

describe('ImageUploadService', () => {
  let service: ImageUploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageUploadService],
    }).compile();

    service = module.get<ImageUploadService>(ImageUploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should upload an image without resizing', async () => {
    const mockFile = { buffer: Buffer.from('test') } as Express.Multer.File;
    const mockBucket = 'test-bucket';
    const mockFolder = 'test-folder';
    const mockBuffer = Buffer.from('resized image');

    (sharp as jest.MockedFunction<typeof sharp>).mockReturnValue({
      jpeg: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockResolvedValue(mockBuffer),
    } as any);

    const result = await service.uploadImage(mockFile, mockBucket, mockFolder);

    expect(sharp).toHaveBeenCalledWith(mockFile.buffer);
    expect(result).toBe(`${mockFolder}/unique-id.jpg`);
    expect(new AWS.S3().upload).toHaveBeenCalledWith(
      expect.objectContaining({
        Bucket: mockBucket,
        Key: `${mockFolder}/unique-id.jpg`,
        Body: mockBuffer,
        ContentType: 'image/jpeg',
      }),
    );
  });

  it('should upload an image with resizing', async () => {
    const mockFile = { buffer: Buffer.from('test') } as Express.Multer.File;
    const mockBucket = 'test-bucket';
    const mockFolder = 'test-folder';
    const mockBuffer = Buffer.from('resized image');
    const resizeWidth = 200;
    const quality = 80;

    (sharp as jest.MockedFunction<typeof sharp>).mockReturnValue({
      resize: jest.fn().mockReturnThis(),
      jpeg: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockResolvedValue(mockBuffer),
    } as any);

    const result = await service.uploadImage(
      mockFile,
      mockBucket,
      mockFolder,
      resizeWidth,
      quality,
    );

    expect(sharp).toHaveBeenCalledWith(mockFile.buffer);
    expect(sharp().resize).toHaveBeenCalledWith(
      expect.objectContaining({
        fit: sharp.fit.contain,
        width: resizeWidth,
      }),
    );
    expect(sharp().jpeg).toHaveBeenCalledWith({ quality });
    expect(result).toBe(`${mockFolder}/unique-id.jpg`);
    expect(new AWS.S3().upload).toHaveBeenCalledWith(
      expect.objectContaining({
        Bucket: mockBucket,
        Key: `${mockFolder}/unique-id.jpg`,
        Body: mockBuffer,
        ContentType: 'image/jpeg',
      }),
    );
  });

  it('should handle incorrect quality values gracefully', async () => {
    const mockFile = { buffer: Buffer.from('test') } as Express.Multer.File;
    const mockBucket = 'test-bucket';
    const mockFolder = 'test-folder';
    const mockBuffer = Buffer.from('resized image');

    (sharp as jest.MockedFunction<typeof sharp>).mockReturnValue({
      jpeg: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockResolvedValue(mockBuffer),
    } as any);

    const incorrectQuality = 150;
    const result = await service.uploadImage(
      mockFile,
      mockBucket,
      mockFolder,
      undefined,
      incorrectQuality,
    );

    expect(sharp).toHaveBeenCalledWith(mockFile.buffer);
    expect(sharp().jpeg).toHaveBeenCalledWith({ quality: 100 });
    expect(result).toBe(`${mockFolder}/unique-id.jpg`);
    expect(new AWS.S3().upload).toHaveBeenCalledWith(
      expect.objectContaining({
        Bucket: mockBucket,
        Key: `${mockFolder}/unique-id.jpg`,
        Body: mockBuffer,
        ContentType: 'image/jpeg',
      }),
    );
  });
});
