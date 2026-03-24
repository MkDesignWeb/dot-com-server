import { prisma } from "../data/data.config";
import { BUSINESS_TIMEZONE, getBusinessMonthRange } from "../utils/time.utils";

export interface MedicalCertificateRecordInput {
  presentedAt: Date;
  startDate: Date;
  endDate: Date;
  source: string;
  note?: string | null;
  approved: boolean;
}

export interface PunchDayStatusRow {
  id: number;
  employeeId: number;
  date: Date | string;
  status: string;
  medicalCertificatePresentedAt: Date | string | null;
  medicalCertificateStartDate: Date | string | null;
  medicalCertificateEndDate: Date | string | null;
  medicalCertificateSource: string | null;
  medicalCertificateNote: string | null;
  medicalCertificateApproved: boolean | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

class PunchDayStatusRepository {
  private schemaReadyPromise?: Promise<void>;

  private async ensureSchema() {
    if (!this.schemaReadyPromise) {
      this.schemaReadyPromise = (async () => {
        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "PunchDayStatus" (
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
            "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "PunchDayStatus_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
          )
        `);

        await prisma.$executeRawUnsafe(`
          CREATE UNIQUE INDEX IF NOT EXISTS "PunchDayStatus_employeeId_date_key"
          ON "PunchDayStatus"("employeeId", "date")
        `);
      })();
    }

    await this.schemaReadyPromise;
  }

  async upsert(
    employeeId: string | number,
    date: Date,
    status: string,
    medicalCertificate?: MedicalCertificateRecordInput | null
  ) {
    await this.ensureSchema();

    const normalizedEmployeeId = Number(employeeId);
    const medicalCertificateData = medicalCertificate
      ? {
          medicalCertificatePresentedAt: medicalCertificate.presentedAt,
          medicalCertificateStartDate: medicalCertificate.startDate,
          medicalCertificateEndDate: medicalCertificate.endDate,
          medicalCertificateSource: medicalCertificate.source,
          medicalCertificateNote: medicalCertificate.note ?? null,
          medicalCertificateApproved: medicalCertificate.approved
        }
      : {
          medicalCertificatePresentedAt: null,
          medicalCertificateStartDate: null,
          medicalCertificateEndDate: null,
          medicalCertificateSource: null,
          medicalCertificateNote: null,
          medicalCertificateApproved: null
        };

    await prisma.$executeRaw`
      INSERT INTO "PunchDayStatus" (
        "employeeId",
        "date",
        "status",
        "medicalCertificatePresentedAt",
        "medicalCertificateStartDate",
        "medicalCertificateEndDate",
        "medicalCertificateSource",
        "medicalCertificateNote",
        "medicalCertificateApproved"
      )
      VALUES (
        ${normalizedEmployeeId},
        ${date},
        ${status},
        ${medicalCertificateData.medicalCertificatePresentedAt},
        ${medicalCertificateData.medicalCertificateStartDate},
        ${medicalCertificateData.medicalCertificateEndDate},
        ${medicalCertificateData.medicalCertificateSource},
        ${medicalCertificateData.medicalCertificateNote},
        ${medicalCertificateData.medicalCertificateApproved}
      )
      ON CONFLICT("employeeId", "date")
      DO UPDATE SET
        "status" = excluded."status",
        "medicalCertificatePresentedAt" = excluded."medicalCertificatePresentedAt",
        "medicalCertificateStartDate" = excluded."medicalCertificateStartDate",
        "medicalCertificateEndDate" = excluded."medicalCertificateEndDate",
        "medicalCertificateSource" = excluded."medicalCertificateSource",
        "medicalCertificateNote" = excluded."medicalCertificateNote",
        "medicalCertificateApproved" = excluded."medicalCertificateApproved",
        "updatedAt" = CURRENT_TIMESTAMP
    `;

    const rows = await prisma.$queryRaw<PunchDayStatusRow[]>`
      SELECT
        "id",
        "employeeId",
        "date",
        "status",
        "medicalCertificatePresentedAt",
        "medicalCertificateStartDate",
        "medicalCertificateEndDate",
        "medicalCertificateSource",
        "medicalCertificateNote",
        "medicalCertificateApproved",
        "createdAt",
        "updatedAt"
      FROM "PunchDayStatus"
      WHERE "employeeId" = ${normalizedEmployeeId}
        AND "date" = ${date}
      LIMIT 1
    `;

    return rows[0];
  }

  async getMonth(employeeId: string | number, month: number, year: number) {
    await this.ensureSchema();

    const { start, end } = getBusinessMonthRange(month, year, BUSINESS_TIMEZONE);

    return await prisma.$queryRaw<PunchDayStatusRow[]>`
      SELECT
        "id",
        "employeeId",
        "date",
        "status",
        "medicalCertificatePresentedAt",
        "medicalCertificateStartDate",
        "medicalCertificateEndDate",
        "medicalCertificateSource",
        "medicalCertificateNote",
        "medicalCertificateApproved",
        "createdAt",
        "updatedAt"
      FROM "PunchDayStatus"
      WHERE "employeeId" = ${Number(employeeId)}
        AND "date" >= ${start}
        AND "date" <= ${end}
      ORDER BY "date" ASC
    `;
  }

  async getYearRange(employeeId: string | number) {
    await this.ensureSchema();

    const minRows = await prisma.$queryRaw<Array<{ date: Date | string }>>`
      SELECT
        "date"
      FROM "PunchDayStatus"
      WHERE "employeeId" = ${Number(employeeId)}
      ORDER BY "date" ASC
      LIMIT 1
    `;

    const maxRows = await prisma.$queryRaw<Array<{ date: Date | string }>>`
      SELECT
        "date"
      FROM "PunchDayStatus"
      WHERE "employeeId" = ${Number(employeeId)}
      ORDER BY "date" DESC
      LIMIT 1
    `;

    const minDate = minRows[0]?.date;
    const maxDate = maxRows[0]?.date;

    if (!minDate || !maxDate) {
      return { minYear: null, maxYear: null };
    }

    return {
      minYear: new Date(minDate).getUTCFullYear(),
      maxYear: new Date(maxDate).getUTCFullYear()
    };
  }
}

export default new PunchDayStatusRepository();
