-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "salesCount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "stock" SET DEFAULT 0;
