-- AlterTable
ALTER TABLE `Day` ADD COLUMN `completionPercentage` VARCHAR(191) NULL,
    ADD COLUMN `isRestDay` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Exercise` ADD COLUMN `rest` INTEGER NULL,
    ADD COLUMN `setsAndReps` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `WorkoutPlan` ADD COLUMN `completionPercentage` VARCHAR(191) NULL;
