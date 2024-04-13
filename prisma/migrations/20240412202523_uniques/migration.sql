/*
  Warnings:

  - A unique constraint covering the columns `[dayId]` on the table `Day` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[exerciseId]` on the table `Exercise` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[weekId]` on the table `Week` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Day_dayId_key` ON `Day`(`dayId`);

-- CreateIndex
CREATE UNIQUE INDEX `Exercise_exerciseId_key` ON `Exercise`(`exerciseId`);

-- CreateIndex
CREATE UNIQUE INDEX `Week_weekId_key` ON `Week`(`weekId`);
