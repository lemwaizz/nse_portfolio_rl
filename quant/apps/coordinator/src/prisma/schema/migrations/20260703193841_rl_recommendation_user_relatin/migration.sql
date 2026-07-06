/*
  Warnings:

  - Added the required column `userId` to the `rl_recommendation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "rl_recommendation" ADD COLUMN     "rationale" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "rl_recommendation" ADD CONSTRAINT "rl_recommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
