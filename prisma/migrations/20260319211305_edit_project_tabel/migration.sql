/*
  Warnings:

  - You are about to drop the column `access_token` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `architecture_notes` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `budget` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `challenges` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `design_process` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `due_date` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `invoice_status` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `learnings` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `problem` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `research_notes` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `solution` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `projects` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "projects" DROP COLUMN "access_token",
DROP COLUMN "architecture_notes",
DROP COLUMN "budget",
DROP COLUMN "challenges",
DROP COLUMN "design_process",
DROP COLUMN "due_date",
DROP COLUMN "invoice_status",
DROP COLUMN "learnings",
DROP COLUMN "problem",
DROP COLUMN "research_notes",
DROP COLUMN "solution",
DROP COLUMN "start_date";
