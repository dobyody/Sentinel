// src/config/s3.ts
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from './env';
import { v4 as uuid } from 'uuid';

export const s3Client = new S3Client({
  region: env.S3_REGION,
  ...(env.S3_ENDPOINT ? { endpoint: env.S3_ENDPOINT, forcePathStyle: true } : {}),
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload a buffer directly to S3 and return its public URL.
 */
export async function uploadToS3(
  buffer: Buffer,
  mimetype: string,
  folder: string = 'reports'
): Promise<string> {
  const ext = mimetype.split('/')[1] ?? 'jpg';
  const key = `${folder}/${uuid()}.${ext}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    })
  );

  return `${env.S3_PUBLIC_URL}/${key}`;
}

/**
 * Generate a short-lived pre-signed PUT URL so the frontend can upload
 * photos directly to S3 without going through the API server.
 */
export async function createPresignedUploadUrl(
  mimetype: string,
  folder: string = 'reports'
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const ext = mimetype.split('/')[1] ?? 'jpg';
  const key = `${folder}/${uuid()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: key,
    ContentType: mimetype,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 min
  const publicUrl = `${env.S3_PUBLIC_URL}/${key}`;

  return { uploadUrl, publicUrl };
}

/**
 * Delete an object from S3 by its public URL.
 */
export async function deleteFromS3(publicUrl: string): Promise<void> {
  const key = publicUrl.replace(`${env.S3_PUBLIC_URL}/`, '');
  await s3Client.send(
    new DeleteObjectCommand({ Bucket: env.S3_BUCKET_NAME, Key: key })
  );
}
