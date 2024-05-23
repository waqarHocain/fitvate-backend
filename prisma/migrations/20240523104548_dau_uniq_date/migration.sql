/*
  Warnings:

  - A unique constraint covering the columns `[date]` on the table `DailyActiveUser` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `DailyActiveUser` MODIFY `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX `DailyActiveUser_date_key` ON `DailyActiveUser`(`date`);
