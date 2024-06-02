/*
  Warnings:

  - Added the required column `topic` to the `Article` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Article` table without a default value. This is not possible if the table is not empty.
  - Made the column `imageUrl` on table `Article` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Article` ADD COLUMN `source` VARCHAR(191) NULL,
    ADD COLUMN `topic` VARCHAR(191) NOT NULL,
    ADD COLUMN `type` VARCHAR(191) NOT NULL,
    MODIFY `imageUrl` VARCHAR(191) NOT NULL,
    MODIFY `category` VARCHAR(191) NULL,
    ALTER COLUMN `locale` DROP DEFAULT;
