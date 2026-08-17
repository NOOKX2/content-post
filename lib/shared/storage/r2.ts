import {
  PutBucketCorsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicBaseUrl: string;
};

let r2Client: S3Client | null = null;
let corsEnsured = false;

export function getR2Config(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicBaseUrl = process.env.R2_PUBLIC_URL;

  if (
    !accountId ||
    !accessKeyId ||
    !secretAccessKey ||
    !bucketName ||
    !publicBaseUrl
  ) {
    return null;
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicBaseUrl: publicBaseUrl.replace(/\/$/, ""),
  };
}

function getR2Client(config: R2Config): S3Client {
  if (!r2Client) {
    r2Client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      // AWS SDK default CRC32 checksums break R2 presigned browser PUTs.
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
  }

  return r2Client;
}

export function buildR2PublicUrl(key: string, config: R2Config): string {
  return `${config.publicBaseUrl}/${key}`;
}

function r2CorsOrigins(): string[] {
  const origins = new Set<string>([
    "http://localhost:3000",
    "https://idea-content.vercel.app",
  ]);

  for (const raw of [
    process.env.APP_PUBLIC_URL,
    process.env.AUTH_URL,
    process.env.NEXTAUTH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "",
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
  ]) {
    if (!raw) continue;
    try {
      origins.add(new URL(raw).origin);
    } catch {
      // ignore invalid URL
    }
  }

  return [...origins];
}

async function ensureR2BrowserCors(config: R2Config): Promise<void> {
  if (corsEnsured) return;

  try {
    await getR2Client(config).send(
      new PutBucketCorsCommand({
        Bucket: config.bucketName,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedOrigins: r2CorsOrigins(),
              AllowedMethods: ["GET", "PUT", "HEAD"],
              AllowedHeaders: ["*"],
              ExposeHeaders: ["ETag"],
              MaxAgeSeconds: 3600,
            },
          ],
        },
      })
    );
    corsEnsured = true;
    console.log("[r2] cors | allowed browser PUT from", r2CorsOrigins());
  } catch (error) {
    console.error("[r2] cors | PutBucketCors failed — set CORS in Cloudflare dashboard", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function uploadToR2(input: {
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<string> {
  const config = getR2Config();
  if (!config) {
    throw new Error("Cloudflare R2 is not configured");
  }

  const client = getR2Client(config);

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
    })
  );

  return buildR2PublicUrl(input.key, config);
}

export async function createPresignedUpload(input: {
  key: string;
  contentType: string;
  expiresIn?: number;
}): Promise<{ uploadUrl: string; publicUrl: string }> {
  const config = getR2Config();
  if (!config) {
    throw new Error("Cloudflare R2 is not configured");
  }

  await ensureR2BrowserCors(config);

  const uploadUrl = await getSignedUrl(
    getR2Client(config),
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: input.key,
      ContentType: input.contentType,
    }),
    { expiresIn: input.expiresIn ?? 60 * 5 }
  );

  return {
    uploadUrl,
    publicUrl: buildR2PublicUrl(input.key, config),
  };
}

export function isR2Configured(): boolean {
  return getR2Config() !== null;
}
