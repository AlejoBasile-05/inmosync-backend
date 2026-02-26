-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('HOT', 'WARM', 'COOL', 'COLD');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "status" "LeadStatus" NOT NULL DEFAULT 'COLD';
