-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'AGENT');

-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'AGENT';
