-- AlterTable: separate the live published version from the working copy
ALTER TABLE "Entry" ADD COLUMN "publishedVersionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Entry_publishedVersionId_key" ON "Entry"("publishedVersionId");

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_publishedVersionId_fkey" FOREIGN KEY ("publishedVersionId") REFERENCES "EntryVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
