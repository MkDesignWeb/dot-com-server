import bcrypt from "bcrypt";
import PunchRepository from "../repository/punch.repository";
import PunchDayStatusRepository, { PunchDayStatusRow } from "../repository/punchDayStatus.repository";
import employeeService from "./employee.service";
import { DISPLAY_TIMEZONE, formatDateTimeForDisplay, getDisplayDateParts, nowUtc } from "../utils/time.utils";

type DayStatusType = "normal" | "medical_certificate";

interface MedicalCertificateInput {
    presentedAt: string;
    startDate: string;
    endDate: string;
    source: string;
    note?: string;
    approved?: boolean;
}

class punchService {
    private withDisplayTime<T extends { timeStamp: Date }>(punch: T) {
        const parsedTimeStamp = new Date(punch.timeStamp);
        const parts = getDisplayDateParts(parsedTimeStamp, DISPLAY_TIMEZONE);

        return {
            ...punch,
            displayTimeBr: `${parts.dayBr}, ${parts.timeBr} ${parts.zone}`,
            reportDayBr: parts.dayBr,
            reportTimeBr: parts.timeBr
        };
    }

    private serializeDayStatus(dayStatus: PunchDayStatusRow) {
        return {
            date: new Date(dayStatus.date),
            status: dayStatus.status,
            medicalCertificate: dayStatus.status === "medical_certificate"
                ? {
                    presentedAt: dayStatus.medicalCertificatePresentedAt ? new Date(dayStatus.medicalCertificatePresentedAt) : null,
                    startDate: dayStatus.medicalCertificateStartDate ? new Date(dayStatus.medicalCertificateStartDate) : null,
                    endDate: dayStatus.medicalCertificateEndDate ? new Date(dayStatus.medicalCertificateEndDate) : null,
                    source: dayStatus.medicalCertificateSource,
                    note: dayStatus.medicalCertificateNote,
                    approved: dayStatus.medicalCertificateApproved
                }
                : null
        };
    }

    async set(employeeId: string, password: string) {
        if (typeof employeeId !== "string" || typeof password !== "string") {
            throw new Error("Invalid input");
        }
        const employee = await employeeService.findById(employeeId);
        if (!employee) {
            throw new Error('Employee not found');
        }
        if (!bcrypt.compareSync(password, employee.password)) {
            throw new Error('Senha incorreta');
        }
        const currentUtc = nowUtc();
        const punchs = await PunchRepository.getDay(employeeId, currentUtc);
        if (punchs.length >= 4) {
            throw new Error('Limite de pontos atingido para hoje');
        }
        const systemLocalDate = currentUtc;
        const punch = await PunchRepository.set(employeeId, employee.name, systemLocalDate);
        const punchWithDisplay = this.withDisplayTime(punch);

        return {
            punch: punchWithDisplay,
            systemLocalDate,
            systemDisplayDateBr: formatDateTimeForDisplay(systemLocalDate, DISPLAY_TIMEZONE),
            punchDisplayTimeBr: punchWithDisplay.displayTimeBr
        };
    }

    async get(employeeId: string, month: number, year: number) {
        if (typeof employeeId !== "string") {
            throw new Error("Invalid input. Expect employeeId:string");
        }

        if (!Number.isInteger(month) || month < 1 || month > 12) {
            throw new Error("Invalid input. Expect month:number between 1 and 12");
        }

        if (!Number.isInteger(year) || year < 1) {
            throw new Error("Invalid input. Expect year:number greater than 0");
        }

        const [punchs, dayStatusesRaw, punchYearRange, dayStatusYearRange] = await Promise.all([
            PunchRepository.getMonth(employeeId, month, year),
            PunchDayStatusRepository.getMonth(employeeId, month, year),
            PunchRepository.getYearRange(employeeId),
            PunchDayStatusRepository.getYearRange(employeeId)
        ]);

        const minYearCandidates = [punchYearRange.minYear, dayStatusYearRange.minYear]
            .filter((value): value is number => value !== null);
        const maxYearCandidates = [punchYearRange.maxYear, dayStatusYearRange.maxYear]
            .filter((value): value is number => value !== null);

        const dayStatuses = dayStatusesRaw.map((dayStatus) => this.serializeDayStatus(dayStatus));

        return {
            punchs: punchs.map((punch) => this.withDisplayTime(punch)),
            dayStatuses,
            minYear: minYearCandidates.length ? Math.min(...minYearCandidates) : null,
            maxYear: maxYearCandidates.length ? Math.max(...maxYearCandidates) : null
        };
    }

    async updateDayStatus(
        employeeId: string,
        date: string,
        status: DayStatusType,
        medicalCertificate?: MedicalCertificateInput
    ) {
        if (typeof employeeId !== "string" || !employeeId.trim()) {
            throw new Error("Invalid input. Expect employeeId:string");
        }

        if (typeof date !== "string") {
            throw new Error("Invalid input. Expect date:string");
        }

        if (status !== "normal" && status !== "medical_certificate") {
            throw new Error("Invalid input. Expect status to be normal or medical_certificate");
        }

        const employee = await employeeService.findById(employeeId);
        if (!employee) {
            throw new Error("Employee not found");
        }

        const parsedDate = new Date(date);
        if (Number.isNaN(parsedDate.getTime())) {
            throw new Error("Invalid input. date must be a valid date");
        }

        const normalizedDate = new Date(Date.UTC(
            parsedDate.getUTCFullYear(),
            parsedDate.getUTCMonth(),
            parsedDate.getUTCDate(),
            0,
            0,
            0,
            0
        ));

        let normalizedMedicalCertificate = null;

        if (status === "medical_certificate") {
            if (!medicalCertificate || typeof medicalCertificate !== "object") {
                throw new Error("Invalid input. medicalCertificate is required when status is medical_certificate");
            }

            const parsedPresentedAt = new Date(medicalCertificate.presentedAt);
            const parsedStartDate = new Date(medicalCertificate.startDate);
            const parsedEndDate = new Date(medicalCertificate.endDate);

            if (
                Number.isNaN(parsedPresentedAt.getTime()) ||
                Number.isNaN(parsedStartDate.getTime()) ||
                Number.isNaN(parsedEndDate.getTime())
            ) {
                throw new Error("Invalid input. medicalCertificate dates must be valid");
            }

            if (typeof medicalCertificate.source !== "string" || !medicalCertificate.source.trim()) {
                throw new Error("Invalid input. medicalCertificate.source is required");
            }

            normalizedMedicalCertificate = {
                presentedAt: parsedPresentedAt,
                startDate: parsedStartDate,
                endDate: parsedEndDate,
                source: medicalCertificate.source,
                note: typeof medicalCertificate.note === "string" ? medicalCertificate.note : null,
                approved: true
            };
        }

        const updatedDayStatus = await PunchDayStatusRepository.upsert(
            employeeId,
            normalizedDate,
            status,
            normalizedMedicalCertificate
        );

        return this.serializeDayStatus(updatedDayStatus);
    }

    async updateTime(punchId: string, timeStamp: string) {
        if (typeof punchId !== "string") {
            throw new Error("Invalid input. Expect punchId:string");
        }

        if (typeof timeStamp !== "string") {
            throw new Error("Invalid input. Expect timeStamp:string");
        }

        const parsedDate = new Date(timeStamp);
        if (Number.isNaN(parsedDate.getTime())) {
            throw new Error("Invalid input. timeStamp must be a valid date");
        }

        const updatedPunch = await PunchRepository.updateTime(punchId, parsedDate);
        if (!updatedPunch) {
            throw new Error("Punch not found");
        }

        return updatedPunch;
    }

    async delete(punchId: string) {
        if (typeof punchId !== "string") {
            throw new Error("Invalid input. Expect punchId:string");
        }

        const deletedPunch = await PunchRepository.deleteById(punchId);
        if (!deletedPunch) {
            throw new Error("Punch not found");
        }

        return { message: "Punch deleted successfully" };
    }
}


export default new punchService();
