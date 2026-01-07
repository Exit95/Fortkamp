import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Umgebungsvariablen aus process.env (Docker) oder import.meta.env (Build-Zeit) lesen
const getEnv = (key: string, defaultValue: string = ''): string => {
  // @ts-ignore
  const metaEnvValue = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env[key] : undefined;
  const processEnvValue = typeof process !== 'undefined' && process.env ? process.env[key] : undefined;
  return metaEnvValue || processEnvValue || defaultValue;
};

// Lazy initialization - S3Client wird erst bei Bedarf erstellt
let _s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!_s3Client) {
    const endpoint = getEnv('S3_ENDPOINT', 'https://nbg1.your-objectstorage.com');
    const accessKey = getEnv('S3_ACCESS_KEY_ID') || getEnv('S3_ACCESS_KEY');
    const secretKey = getEnv('S3_SECRET_ACCESS_KEY') || getEnv('S3_SECRET_KEY');
    const region = getEnv('S3_REGION', 'eu-central');

    console.log('[S3] Creating S3Client with config:', {
      endpoint: endpoint ? endpoint.substring(0, 40) : 'MISSING',
      region,
      hasAccessKey: !!accessKey,
      hasSecretKey: !!secretKey,
    });

    _s3Client = new S3Client({
      endpoint: endpoint,
      region: region,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      forcePathStyle: true,
    });
  }
  return _s3Client;
}

const getBucket = () => getEnv('S3_BUCKET', 'danapfel-digital');
const getPrefix = () => getEnv('S3_PREFIX', 'galabau/');

// Prüfen ob S3 konfiguriert ist
export function isS3Configured(): boolean {
  const endpoint = getEnv('S3_ENDPOINT');
  const accessKey = getEnv('S3_ACCESS_KEY_ID') || getEnv('S3_ACCESS_KEY');
  const secretKey = getEnv('S3_SECRET_ACCESS_KEY') || getEnv('S3_SECRET_KEY');
  const bucket = getBucket();

  console.log('[S3] Config check:', {
    hasEndpoint: !!endpoint,
    hasAccessKey: !!accessKey,
    hasSecretKey: !!secretKey,
    hasBucket: !!bucket,
  });

  return !!(endpoint && accessKey && secretKey && bucket);
}

// Dateinamen sanitizen
export function sanitizeFilename(filename: string): string {
  const ext = filename.split('.').pop() || '';
  const nameWithoutExt = filename.replace(`.${ext}`, '');
  const sanitized = nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}_${random}_${sanitized}.${ext}`;
}

// Prefix für Upload-Typ generieren
export function getUploadPrefix(type: 'service' | 'project' | 'general', slugOrId?: string): string {
  const basePrefix = getPrefix();
  switch (type) {
    case 'service':
      return `${basePrefix}uploads/services/${slugOrId || 'general'}/`;
    case 'project':
      return `${basePrefix}uploads/projects/${slugOrId || 'general'}/`;
    case 'general':
      return `${basePrefix}uploads/general/`;
    default:
      return `${basePrefix}uploads/tmp/`;
  }
}

// Presigned URL für Upload generieren
export async function getPresignedUploadUrl(
  type: 'service' | 'project' | 'general',
  slugOrId: string,
  filename: string,
  contentType: string
): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  const sanitizedFilename = sanitizeFilename(filename);
  const prefix = getUploadPrefix(type, slugOrId);
  const key = `${prefix}${sanitizedFilename}`;
  const bucket = getBucket();

  console.log('[S3] Generating presigned URL:', { type, slugOrId, key, contentType });

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(getS3Client(), command, { expiresIn: 3600 });
  const publicUrl = `https://${bucket}.nbg1.your-objectstorage.com/${key}`;

  return { uploadUrl, publicUrl, key };
}

export async function uploadFile(file: Buffer, filename: string, contentType: string): Promise<string> {
  const prefix = getPrefix();
  const bucket = getBucket();
  const key = `${prefix}${Date.now()}-${filename}`;

  console.log('[S3] Uploading file:', { bucket, key, contentType, size: file.length });

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await getS3Client().send(command);

  // Öffentliche URL für Hetzner Object Storage
  const publicUrl = `https://${bucket}.nbg1.your-objectstorage.com/${key}`;
  console.log('[S3] Upload successful:', publicUrl);
  return publicUrl;
}

// Datei aus S3 löschen (per Key)
export async function deleteFileByKey(key: string): Promise<void> {
  console.log('[S3] Deleting file:', key);

  const command = new DeleteObjectCommand({
    Bucket: getBucket(),
    Key: key,
  });

  await getS3Client().send(command);
  console.log('[S3] File deleted successfully');
}

// Datei aus S3 löschen (per URL) - Legacy
export async function deleteFile(url: string): Promise<void> {
  const key = url.split('.com/')[1];
  return deleteFileByKey(key);
}

export async function listFiles(prefix?: string): Promise<{
  key: string;
  url: string;
  size: number;
  lastModified: Date;
}[]> {
  const bucket = getBucket();
  const endpoint = getEnv('S3_ENDPOINT', 'https://nbg1.your-objectstorage.com');
  const fullPrefix = prefix || getPrefix();

  const command = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: fullPrefix,
  });

  const response = await getS3Client().send(command);

  return (response.Contents || []).map((obj) => ({
    key: obj.Key || '',
    url: `${endpoint}/${bucket}/${obj.Key}`,
    size: obj.Size || 0,
    lastModified: obj.LastModified || new Date(),
  }));
}

export function getPublicUrl(key: string): string {
  const bucket = getBucket();
  const endpoint = getEnv('S3_ENDPOINT', 'https://nbg1.your-objectstorage.com');
  return `${endpoint}/${bucket}/${key}`;
}

// Direkter Upload zu S3 (für Chunked Upload)
export async function uploadToS3Direct(buffer: Buffer, key: string, contentType: string): Promise<string> {
  const bucket = getBucket();

  console.log('[S3] Direct upload:', { bucket, key, contentType, size: buffer.length });

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await getS3Client().send(command);

  // Öffentliche URL für Hetzner Object Storage
  const publicUrl = `https://${bucket}.nbg1.your-objectstorage.com/${key}`;
  console.log('[S3] Direct upload successful:', publicUrl);
  return publicUrl;
}

