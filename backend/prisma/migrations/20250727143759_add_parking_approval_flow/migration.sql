-- AlterTable
ALTER TABLE "parking_spots" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ownerId" TEXT,
ALTER COLUMN "available" SET DEFAULT false;
