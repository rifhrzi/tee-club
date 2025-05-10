/*
  Warnings:

  - You are about to drop the column `salesCount` on the `Product` table. All the data in the column will be lost.
  - Made the column `description` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "salesCount",
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "stock" DROP DEFAULT;
