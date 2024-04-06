-- DropForeignKey
ALTER TABLE `Exercise` DROP FOREIGN KEY `Exercise_dayId_fkey`;

-- AddForeignKey
ALTER TABLE `Exercise` ADD CONSTRAINT `Exercise_dayId_fkey` FOREIGN KEY (`dayId`) REFERENCES `Day`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
