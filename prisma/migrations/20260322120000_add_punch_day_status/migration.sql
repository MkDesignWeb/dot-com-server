-- CreateTable
CREATE TABLE "PunchDayStatus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "medicalCertificatePresentedAt" DATETIME,
    "medicalCertificateStartDate" DATETIME,
    "medicalCertificateEndDate" DATETIME,
    "medicalCertificateSource" TEXT,
    "medicalCertificateNote" TEXT,
    "medicalCertificateApproved" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PunchDayStatus_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PunchDayStatus_employeeId_date_key" ON "PunchDayStatus"("employeeId", "date");
