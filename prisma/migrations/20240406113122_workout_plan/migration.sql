/*
  Warnings:

  - You are about to drop the column `workoutPlanId` on the `WorkoutPlan` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[planId]` on the table `WorkoutPlan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `planId` to the `WorkoutPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planName` to the `WorkoutPlan` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `WorkoutPlan_workoutPlanId_key` ON `WorkoutPlan`;

-- AlterTable
ALTER TABLE `WorkoutPlan` DROP COLUMN `workoutPlanId`,
    ADD COLUMN `duration` VARCHAR(191) NULL,
    ADD COLUMN `goal` VARCHAR(191) NULL,
    ADD COLUMN `isPurchased` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `planCategory` VARCHAR(191) NULL,
    ADD COLUMN `planDescription` VARCHAR(191) NULL,
    ADD COLUMN `planId` VARCHAR(191) NOT NULL,
    ADD COLUMN `planName` VARCHAR(191) NOT NULL,
    ADD COLUMN `planThemeColor` VARCHAR(191) NULL,
    ADD COLUMN `planType` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Week` (
    `id` VARCHAR(191) NOT NULL,
    `weekId` VARCHAR(191) NOT NULL,
    `isCompleted` BOOLEAN NOT NULL DEFAULT false,
    `workoutPlanId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Week_weekId_key`(`weekId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Day` (
    `id` VARCHAR(191) NOT NULL,
    `dayId` VARCHAR(191) NOT NULL,
    `isCompleted` BOOLEAN NOT NULL DEFAULT false,
    `weekId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Day_dayId_key`(`dayId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Exercise` (
    `id` VARCHAR(191) NOT NULL,
    `exerciseId` VARCHAR(191) NOT NULL,
    `displayIndex` INTEGER NOT NULL,
    `weightUsed` VARCHAR(191) NOT NULL,
    `isCompleted` BOOLEAN NOT NULL DEFAULT false,
    `dayId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `WorkoutPlan_planId_key` ON `WorkoutPlan`(`planId`);

-- AddForeignKey
ALTER TABLE `Week` ADD CONSTRAINT `Week_workoutPlanId_fkey` FOREIGN KEY (`workoutPlanId`) REFERENCES `WorkoutPlan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Day` ADD CONSTRAINT `Day_weekId_fkey` FOREIGN KEY (`weekId`) REFERENCES `Week`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Exercise` ADD CONSTRAINT `Exercise_dayId_fkey` FOREIGN KEY (`dayId`) REFERENCES `Day`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
