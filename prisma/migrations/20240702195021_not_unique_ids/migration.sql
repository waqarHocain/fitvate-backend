/*
  Warnings:

  - A unique constraint covering the columns `[dayId,weekId]` on the table `Day` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[weekId,workoutPlanId]` on the table `Week` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Day` DROP FOREIGN KEY `Day_weekId_fkey`;

-- DropForeignKey
ALTER TABLE `Exercise` DROP FOREIGN KEY `Exercise_dayId_fkey`;

-- DropIndex
DROP INDEX `Day_dayId_key` ON `Day`;

-- DropIndex
DROP INDEX `Week_weekId_key` ON `Week`;

-- CreateIndex
CREATE UNIQUE INDEX `Day_dayId_weekId_key` ON `Day`(`dayId`, `weekId`);

-- CreateIndex
CREATE UNIQUE INDEX `Week_weekId_workoutPlanId_key` ON `Week`(`weekId`, `workoutPlanId`);

-- AddForeignKey
ALTER TABLE `Day` ADD CONSTRAINT `Day_weekId_fkey` FOREIGN KEY (`weekId`) REFERENCES `Week`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Exercise` ADD CONSTRAINT `Exercise_dayId_fkey` FOREIGN KEY (`dayId`) REFERENCES `Day`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
