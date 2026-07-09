-- CreateTable
CREATE TABLE "dataset" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedById" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "summary" JSONB,
    "isActiveYear" BOOLEAN NOT NULL DEFAULT false,
    "year" INTEGER NOT NULL,

    CONSTRAINT "dataset_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "dataset" ADD CONSTRAINT "dataset_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
