-- DropIndex
DROP INDEX "User_profileImage_key";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "profileImage" DROP NOT NULL;
