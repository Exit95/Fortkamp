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

export async function getUploadUrl(filename: string, contentType: string): Promise<string> {
  const key = `${getPrefix()}${Date.now()}-${filename}`;

  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    ContentType: contentType,
  });

  const signedUrl = await getSignedUrl(getS3Client(), command, { expiresIn: 3600 });
  return signedUrl;
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

export async function deleteFile(url: string): Promise<void> {
  const key = url.split('.com/')[1];

  const command = new DeleteObjectCommand({
    Bucket: getBucket(),
    Key: key,
  });

  await getS3Client().send(command);
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

