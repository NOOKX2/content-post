-- AlterTable
ALTER TABLE "Content" ALTER COLUMN "location" DROP DEFAULT;
ALTER TABLE "Content" ALTER COLUMN "location" TYPE TEXT[] USING (
  CASE
    WHEN "location" IS NULL OR "location" = '' THEN ARRAY[]::TEXT[]
    ELSE ARRAY["location"]
  END
);
