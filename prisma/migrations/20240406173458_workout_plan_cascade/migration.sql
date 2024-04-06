-- DropForeignKey
ALTER TABLE `Day` DROP FOREIGN KEY `Day_weekId_fkey`;

-- DropForeignKey
ALTER TABLE `Week` DROP FOREIGN KEY `Week_workoutPlanId_fkey`;

-- DropForeignKey
ALTER TABLE `WorkoutPlan` DROP FOREIGN KEY `WorkoutPlan_userId_fkey`;

-- AddForeignKey
ALTER TABLE `WorkoutPlan` ADD CONSTRAINT `WorkoutPlan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Week` ADD CONSTRAINT `Week_workoutPlanId_fkey` FOREIGN KEY (`workoutPlanId`) REFERENCES `WorkoutPlan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Day` ADD CONSTRAINT `Day_weekId_fkey` FOREIGN KEY (`weekId`) REFERENCES `Week`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
