-- DropForeignKey
ALTER TABLE `Day` DROP FOREIGN KEY `Day_weekId_fkey`;

-- DropForeignKey
ALTER TABLE `Exercise` DROP FOREIGN KEY `Exercise_dayId_fkey`;

-- DropForeignKey
ALTER TABLE `Week` DROP FOREIGN KEY `Week_workoutPlanId_fkey`;

-- AddForeignKey
ALTER TABLE `Week` ADD CONSTRAINT `Week_workoutPlanId_fkey` FOREIGN KEY (`workoutPlanId`) REFERENCES `WorkoutPlan`(`planId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Day` ADD CONSTRAINT `Day_weekId_fkey` FOREIGN KEY (`weekId`) REFERENCES `Week`(`weekId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Exercise` ADD CONSTRAINT `Exercise_dayId_fkey` FOREIGN KEY (`dayId`) REFERENCES `Day`(`dayId`) ON DELETE CASCADE ON UPDATE CASCADE;
