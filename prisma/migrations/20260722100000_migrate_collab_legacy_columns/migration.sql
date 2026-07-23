-- Migrate legacy CollaborationChannel.participantIds into CollaborationChannelMember
-- before dropping obsolete columns (kind, participantIds) from an older db push schema.
-- Safe to re-run: uses IF EXISTS / ON CONFLICT guards.

DO $$
DECLARE
  participant_type text;
BEGIN
  SELECT c.udt_name
  INTO participant_type
  FROM information_schema.columns AS c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'CollaborationChannel'
    AND c.column_name = 'participantIds';

  IF participant_type IS NULL THEN
    RETURN;
  END IF;

  IF participant_type = '_text' THEN
    INSERT INTO "CollaborationChannelMember" ("id", "channelId", "userId", "createdAt")
    SELECT
      substr(md5(c."id" || ':' || member_id || ':' || clock_timestamp()::text), 1, 25),
      c."id",
      member_id,
      CURRENT_TIMESTAMP
    FROM "CollaborationChannel" AS c
    CROSS JOIN LATERAL unnest(c."participantIds") AS member_id
    WHERE c."participantIds" IS NOT NULL
      AND cardinality(c."participantIds") > 0
      AND member_id IS NOT NULL
      AND btrim(member_id) <> ''
      AND EXISTS (SELECT 1 FROM "User" AS u WHERE u."id" = member_id)
    ON CONFLICT ("channelId", "userId") DO NOTHING;
  ELSIF participant_type = 'jsonb' THEN
    INSERT INTO "CollaborationChannelMember" ("id", "channelId", "userId", "createdAt")
    SELECT
      substr(md5(c."id" || ':' || member_id || ':' || clock_timestamp()::text), 1, 25),
      c."id",
      member_id,
      CURRENT_TIMESTAMP
    FROM "CollaborationChannel" AS c
    CROSS JOIN LATERAL jsonb_array_elements_text(c."participantIds") AS member_id
    WHERE c."participantIds" IS NOT NULL
      AND jsonb_typeof(c."participantIds") = 'array'
      AND member_id IS NOT NULL
      AND btrim(member_id) <> ''
      AND EXISTS (SELECT 1 FROM "User" AS u WHERE u."id" = member_id)
    ON CONFLICT ("channelId", "userId") DO NOTHING;
  END IF;
END $$;

-- kind is derived from slug in application code; column is no longer needed.
DROP INDEX IF EXISTS "CollaborationChannel_kind_idx";

ALTER TABLE "CollaborationChannel" DROP COLUMN IF EXISTS "kind";
ALTER TABLE "CollaborationChannel" DROP COLUMN IF EXISTS "participantIds";
