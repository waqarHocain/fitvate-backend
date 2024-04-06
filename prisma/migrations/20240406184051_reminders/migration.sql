/*
  Warnings:

  - Added the required column `reminderName` to the `Reminder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reminderTime` to the `Reminder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Reminder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uuid` to the `Reminder` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Reminder` DROP FOREIGN KEY `Reminder_userId_fkey`;

-- AlterTable
ALTER TABLE `Reminder` ADD COLUMN `reminderName` VARCHAR(191) NOT NULL,
    ADD COLUMN `reminderTime` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL,
    ADD COLUMN `uuid` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `ReminderRepeatDay` (
    `id` VARCHAR(191) NOT NULL,
    `dayNum` INTEGER NOT NULL,
    `reminderId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Reminder` ADD CONSTRAINT `Reminder_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReminderRepeatDay` ADD CONSTRAINT `ReminderRepeatDay_reminderId_fkey` FOREIGN KEY (`reminderId`) REFERENCES `Reminder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
