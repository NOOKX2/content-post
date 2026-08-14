-- AlterEnum
-- Platform.line / lemon8 already exist from 20260701074602_add_content_model.
ALTER TYPE "MediaType" ADD VALUE IF NOT EXISTS 'graphic';
ALTER TYPE "Platform" ADD VALUE IF NOT EXISTS 'line';
ALTER TYPE "Platform" ADD VALUE IF NOT EXISTS 'lemon8';
