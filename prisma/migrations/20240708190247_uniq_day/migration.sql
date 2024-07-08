/*
  Warnings:

  - The primary key for the `Day` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `workoutPlanId` to the `Exercise` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Exercise` DROP FOREIGN KEY `Exercise_dayId_weekId_fkey`;

-- AlterTable
ALTER TABLE `Day` DROP PRIMARY KEY,
    ADD PRIMARY KEY (`dayId`, `weekId`, `workoutPlanId`);

-- AlterTable
ALTER TABLE `Exercise` ADD COLUMN `workoutPlanId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Exercise` ADD CONSTRAINT `Exercise_dayId_weekId_workoutPlanId_fkey` FOREIGN KEY (`dayId`, `weekId`, `workoutPlanId`) REFERENCES `Day`(`dayId`, `weekId`, `workoutPlanId`) ON DELETE CASCADE ON UPDATE CASCADE;
