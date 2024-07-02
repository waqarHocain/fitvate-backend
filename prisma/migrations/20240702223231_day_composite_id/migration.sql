/*
  Warnings:

  - The primary key for the `Day` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Day` table. All the data in the column will be lost.
  - Added the required column `weekId` to the `Exercise` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Day` DROP FOREIGN KEY `Day_weekId_workoutPlanId_fkey`;

-- DropForeignKey
ALTER TABLE `Exercise` DROP FOREIGN KEY `Exercise_dayId_fkey`;

-- DropIndex
DROP INDEX `Day_dayId_weekId_key` ON `Day`;

-- AlterTable
ALTER TABLE `Day` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD PRIMARY KEY (`dayId`, `weekId`);

-- AlterTable
ALTER TABLE `Exercise` ADD COLUMN `weekId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Day` ADD CONSTRAINT `Day_weekId_workoutPlanId_fkey` FOREIGN KEY (`weekId`, `workoutPlanId`) REFERENCES `Week`(`weekId`, `workoutPlanId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Exercise` ADD CONSTRAINT `Exercise_dayId_weekId_fkey` FOREIGN KEY (`dayId`, `weekId`) REFERENCES `Day`(`dayId`, `weekId`) ON DELETE CASCADE ON UPDATE CASCADE;
