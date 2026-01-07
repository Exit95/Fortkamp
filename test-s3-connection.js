// Test S3 Connection Script
import { S3Client, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// S3 Configuration aus .env.example
const S3_ENDPOINT = 'https://nbg1.your-objectstorage.com';
const S3_REGION = 'eu-central';
const S3_BUCKET = 'danapfel-digital';
const S3_ACCESS_KEY = 'EJM7QHG4BX98EEPUYR5W';
const S3_SECRET_KEY = 'hCXXaEoNo9Xrgr7oJ9LfAgmWG68wmrnj1SrLpT6W';
const S3_PREFIX = 'galabau/';

console.log('🔍 Testing S3 Connection...\n');
console.log('Configuration:');
console.log('  Endpoint:', S3_ENDPOINT);
console.log('  Region:', S3_REGION);
console.log('  Bucket:', S3_BUCKET);
console.log('  Prefix:', S3_PREFIX);
console.log('  Access Key:', S3_ACCESS_KEY.substring(0, 8) + '...');
console.log('');

// Create S3 Client
const s3Client = new S3Client({
  endpoint: S3_ENDPOINT,
  region: S3_REGION,
  credentials: {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_KEY,
  },
  forcePathStyle: true,
});

async function testConnection() {
  try {
    // Test 1: List objects in bucket
    console.log('📋 Test 1: Listing objects in bucket...');
    const listCommand = new ListObjectsV2Command({
      Bucket: S3_BUCKET,
      Prefix: S3_PREFIX,
      MaxKeys: 10,
    });
    
    const listResponse = await s3Client.send(listCommand);
    console.log('✅ Success! Found', listResponse.Contents?.length || 0, 'objects');
    
    if (listResponse.Contents && listResponse.Contents.length > 0) {
      console.log('\nFirst few objects:');
      listResponse.Contents.slice(0, 5).forEach((obj, i) => {
        console.log(`  ${i + 1}. ${obj.Key} (${obj.Size} bytes)`);
      });
    }
    console.log('');

    // Test 2: Generate presigned URL for upload
    console.log('🔗 Test 2: Generating presigned upload URL...');
    const testKey = `${S3_PREFIX}uploads/test/test-${Date.now()}.txt`;
    const putCommand = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: testKey,
      ContentType: 'text/plain',
    });
    
    const presignedUrl = await getSignedUrl(s3Client, putCommand, { expiresIn: 3600 });
    console.log('✅ Success! Generated presigned URL');
    console.log('  Key:', testKey);
    console.log('  URL:', presignedUrl.substring(0, 80) + '...');
    console.log('');

    // Test 3: Check public URL format
    console.log('🌐 Test 3: Public URL format...');
    const publicUrl = `${S3_ENDPOINT}/${S3_BUCKET}/${testKey}`;
    console.log('✅ Public URL would be:', publicUrl);
    console.log('');

    console.log('✅ All tests passed! S3 connection is working.');
    console.log('');
    console.log('📁 Expected folder structure after uploads:');
    console.log(`  ${S3_BUCKET}/`);
    console.log(`  └── ${S3_PREFIX}`);
    console.log('      └── uploads/');
    console.log('          ├── services/');
    console.log('          │   ├── neugestaltung/');
    console.log('          │   ├── pflasterarbeiten/');
    console.log('          │   └── ...');
    console.log('          ├── projects/');
    console.log('          │   ├── projekt-1/');
    console.log('          │   └── ...');
    console.log('          └── general/');
    console.log('');
    console.log('💡 Note: Folders will be created automatically on first upload!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('');
    console.error('Possible issues:');
    console.error('  1. Check if S3_ACCESS_KEY and S3_SECRET_KEY are correct');
    console.error('  2. Check if bucket "' + S3_BUCKET + '" exists');
    console.error('  3. Check if endpoint "' + S3_ENDPOINT + '" is correct');
    console.error('  4. Check if credentials have read/write permissions');
    process.exit(1);
  }
}

testConnection();

