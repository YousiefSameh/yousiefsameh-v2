"use server";

import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, s3Config } from "@/lib/s3-client";

export async function getSignedUploadUrl(
  fileType: string,
  fileName: string,
  folder: string = "uploads"
) {
  try {
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const command = new PutObjectCommand({
      Bucket: s3Config.bucket,
      Key: filePath,
      ContentType: fileType,
      CacheControl: "public, max-age=31536000, immutable",
    });

    // Generate presigned URL for upload (expires in 5 minutes)
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300,
    });

    // Generate public URL
    let publicUrl = "";
    if (s3Config.baseUrl) {
      publicUrl = `${s3Config.baseUrl}/${filePath}`;
    } else {
      const getCommand = new GetObjectCommand({
        Bucket: s3Config.bucket,
        Key: filePath,
      });
      publicUrl = await getSignedUrl(s3Client, getCommand, {
        expiresIn: 31536000,
      });
    }

    return { success: true, signedUrl, publicUrl, filePath };
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return { success: false, error: "Failed to generate upload URL" };
  }
}

export async function deleteFile(path: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: s3Config.bucket,
      Key: path,
    });

    await s3Client.send(command);
    return { success: true };
  } catch (error) {
    console.error("Error deleting file:", error);
    return { success: false, error: "Failed to delete file" };
  }
}