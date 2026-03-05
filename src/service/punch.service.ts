import bcrypt from "bcrypt";
import PunchRepository from "../repository/punch.repository";
import employeeService from "./employee.service";


class punchService {
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
        const punchs = await PunchRepository.getDay(employeeId);
        if (punchs.length >= 4) {
            throw new Error('Limite de pontos atingido para hoje');
        }
        const systemLocalDate = new Date();
        const punch = await PunchRepository.set(employeeId, employee.name, systemLocalDate);
        return {
            punch,
            systemLocalDate
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

        const [punchs, yearRange] = await Promise.all([
            PunchRepository.getMonth(employeeId, month, year),
            PunchRepository.getYearRange(employeeId)
        ]);

        return {
            punchs,
            minYear: yearRange.minYear,
            maxYear: yearRange.maxYear
        };
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
