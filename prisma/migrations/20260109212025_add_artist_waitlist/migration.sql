-- CreateTable
CREATE TABLE "ArtistWaitlist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "instagramHandle" TEXT,
    "pinterestHandle" TEXT,
    "portfolioUrl" TEXT,
    "specialization" TEXT,
    "yearsExperience" INTEGER,
    "offeringDescription" TEXT NOT NULL,
    "waitlistPosition" SERIAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArtistWaitlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArtistWaitlist_email_key" ON "ArtistWaitlist"("email");

-- CreateIndex
CREATE INDEX "ArtistWaitlist_waitlistPosition_idx" ON "ArtistWaitlist"("waitlistPosition");

-- CreateIndex
CREATE INDEX "ArtistWaitlist_status_idx" ON "ArtistWaitlist"("status");
