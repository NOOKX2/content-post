-- AlterTable
CREATE TYPE "TaskPriority" AS ENUM ('urgent', 'high', 'medium', 'low');

ALTER TABLE "Task" ADD COLUMN "description" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Task" ADD COLUMN "priority" "TaskPriority" NOT NULL DEFAULT 'medium';
