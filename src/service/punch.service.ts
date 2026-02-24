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
        return await PunchRepository.set(employeeId, new Date());
    }
    
    async get(employeeId: string, time?: "day" | "all") {
        if (typeof employeeId !== "string") {
            throw new Error("Invalid input");
        }
        switch (time) {
            case "day":
                return await PunchRepository.getDay(employeeId);
            default:
                return await PunchRepository.getAll(employeeId);
        }
    }
}


export default new punchService();