import bcrypt from "bcrypt";
import { CreateEmployeeDTO } from "../types";
import employeeRepository from "../repository/employee.repository";
import punchRepository from "../repository/punch.repository";

class employeeService {
    async create(data: CreateEmployeeDTO) {
        const { name, companny, password, admissionDate } = data;

        if (
            typeof name !== "string" ||
            typeof companny !== "string" ||
            typeof password !== "string" ||
            !admissionDate
        ) {
            throw new Error(
                "Invalid input. Expect name:string, companny:string, password:string, admissionDate:string|Date"
            );
        }

        const existing = await employeeRepository.findByName(name);
        if (existing) {
            throw new Error(`O funcionário(a) '${name}' já existe`);
        }

        const hashed = await bcrypt.hash(password, 10);

        const employee = {
            name,
            companny,
            password: hashed,
            admissionDate: (() => {
                const [y, m, d] = String(admissionDate).split('-').map(Number);
                return new Date(y, m - 1, d);
            })()
        };

        const savedEmployee = await employeeRepository.create(employee);
        const { password: _, ...rest } = savedEmployee;
        return rest;
    }

    async findById(id: string | number) {
        const employee = await employeeRepository.findById(id);
        if (!employee) {
            throw new Error('Employee not found');
        }
        return employee;
    }

    async list() {
        const employees = await employeeRepository.list();
        const safe = employees.map(u => {
            const date = new Date(u.admissionDate);
            // Se a data for exatamente meia-noite UTC (comum em dados legados ou do SQLite),
            // adicionamos 12 horas para garantir que ela permaneça no mesmo dia em qualquer fuso.
            if (date.getUTCHours() === 0) {
                date.setUTCHours(12);
            }
            return {
                id: u.id,
                name: u.name,
                companny: u.companny,
                admissionDate: date
            };
        });
        return safe;
    }

    async delete(id: string | number) {
        const employees = await employeeRepository.findById(id);
        if (!employees) {
            throw new Error('Employee not found');
        }

        await employeeRepository.delete(id);
        return { message: 'Employee deleted successfully' };
    }

    async setPunch(id: string | number, date: string) {
        const employee = await this.findById(id);
        if (!employee) {
            throw new Error('Employee not found');
        }

        const result = await punchRepository.set(id, employee.name, new Date(date));
        return { message: 'Punch set successfully', result };
    }
}

export default new employeeService();
