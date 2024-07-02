/*
  Warnings:

  - The primary key for the `Week` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Week` table. All the data in the column will be lost.
  - Added the required column `workoutPlanId` to the `Day` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Day` DROP FOREIGN KEY `Day_weekId_fkey`;

-- DropIndex
DROP INDEX `Week_weekId_workoutPlanId_key` ON `Week`;

-- AlterTable
ALTER TABLE `Day` ADD COLUMN `workoutPlanId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Week` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD PRIMARY KEY (`weekId`, `workoutPlanId`);

-- AddForeignKey
ALTER TABLE `Day` ADD CONSTRAINT `Day_weekId_workoutPlanId_fkey` FOREIGN KEY (`weekId`, `workoutPlanId`) REFERENCES `Week`(`weekId`, `workoutPlanId`) ON DELETE RESTRICT ON UPDATE CASCADE;
