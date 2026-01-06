import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  endpoint: import.meta.env.S3_ENDPOINT || 'https://nbg1.your-objectstorage.com',
  region: import.meta.env.S3_REGION || 'eu-central',
  credentials: {
    accessKeyId: import.meta.env.S3_ACCESS_KEY || '',
    secretAccessKey: import.meta.env.S3_SECRET_KEY || '',
  },
  forcePathStyle: true,
});

const BUCKET = import.meta.env.S3_BUCKET || 'danapfel-digital';
const PREFIX = 'galabau/';

export async function getUploadUrl(filename: string, contentType: string): Promise<string> {
  const key = `${PREFIX}${Date.now()}-${filename}`;
  
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return signedUrl;
}

export async function uploadFile(file: Buffer, filename: string, contentType: string): Promise<string> {
  const key = `${PREFIX}${Date.now()}-${filename}`;
  
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await s3Client.send(command);
  
  return `https://${BUCKET}.nbg1.your-objectstorage.com/${key}`;
}

export async function deleteFile(url: string): Promise<void> {
  const key = url.split('.com/')[1];
  
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  await s3Client.send(command);
}

export function getPublicUrl(key: string): string {
  return `https://${BUCKET}.nbg1.your-objectstorage.com/${key}`;
}

