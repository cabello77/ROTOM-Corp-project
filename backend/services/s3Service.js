const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const BUCKET_REGION = process.env.AWS_REGION || 'us-east-1';

/**
 * Upload a file to S3
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} originalName - Original filename
 * @param {string} mimetype - File MIME type
 * @returns {Promise<string>} - The S3 URL of the uploaded file
 */
async function uploadToS3(fileBuffer, originalName, mimetype) {
  if (!BUCKET_NAME) {
    throw new Error('AWS_S3_BUCKET_NAME environment variable is not set');
  }

  // Generate unique filename
  const ext = path.extname(originalName).toLowerCase();
  const filename = `profile-pictures/${Date.now()}-${uuidv4()}${ext}`;

  // Upload to S3
  // Note: ACL is not used - bucket policy should handle public access
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: fileBuffer,
    ContentType: mimetype,
    // ACL removed - use bucket policy for public access instead
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    console.error('S3 upload failed:', error.message || error.name);
    
    // Create a clean error object without circular references
    const cleanError = new Error(error.message || 'S3 upload failed');
    cleanError.name = error.name || 'S3Error';
    cleanError.code = error.Code || error.$metadata?.httpStatusCode;
    throw cleanError;
  }

  // Return the public URL
  // Format: https://bucket-name.s3.region.amazonaws.com/key
  const publicUrl = `https://${BUCKET_NAME}.s3.${BUCKET_REGION}.amazonaws.com/${filename}`;
  return publicUrl;
}

/**
 * Delete a file from S3
 * @param {string} s3Url - The S3 URL of the file to delete
 * @returns {Promise<void>}
 */
async function deleteFromS3(s3Url) {
  if (!BUCKET_NAME || !s3Url) {
    return;
  }

  try {
    // Extract the key from the S3 URL
    // URL format: https://bucket-name.s3.region.amazonaws.com/key
    const urlParts = s3Url.split('.amazonaws.com/');
    if (urlParts.length !== 2) {
      console.warn('Invalid S3 URL format:', s3Url);
      return;
    }

    const key = urlParts[1];

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    console.log('Deleted file from S3:', key);
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    // Don't throw - deletion failures shouldn't break the flow
  }
}

/**
 * Check if S3 is properly configured
 * @returns {boolean}
 */
function isS3Configured() {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET_NAME &&
    process.env.AWS_REGION
  );
}

module.exports = {
  uploadToS3,
  deleteFromS3,
  isS3Configured,
};

