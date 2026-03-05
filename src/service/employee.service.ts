import bcrypt from "bcrypt";
import { CreateEmployeeDTO } from "../types";
import employeeRepository from "../repository/employee.repository";
import punchRepository from "../repository/punch.repository";

class employeeService {
    async create(data: CreateEmployeeDTO) {
        const { name, companny, password } = data;

        if (
            typeof name !== "string" ||
            typeof companny !== "number" ||
            typeof password !== "string"
        ) {
            throw new Error(
                "Invalid input. Expect name:string, companny:number, password:string"
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
            password: hashed
        };

        const savedEmployee = await employeeRepository.create(employee);

        const { password: _, ...rest } = savedEmployee.toObject();
        return rest;
    }

    async findById(id: string) {
        if (typeof id !== "string") {
            throw new Error("Invalid input. Expect id: string");
        }
        const employee = await employeeRepository.findById(id);
        if (!employee) {
            throw new Error('Employee not found');
        }
        return employee;
    }

    async list() {
          const employees = await employeeRepository.list();
          const safe = employees.map(u => ({ id: u.id, name: u.name, companny: u.companny }));
          return safe;
    }

    async delete(id: string) {
        if (typeof id !== "string") {
            throw new Error("Invalid input. Expect id:string");
        }
        
          const employees = await employeeRepository.findById(id);
          if (!employees) {
            throw new Error('Employee not found');
          }
        
          await employeeRepository.delete(id);
          return { message: 'Employee deleted successfully' };
    }

    async setPunch(id: string, date: string) {
        if (typeof id !== "string" || typeof date !== "string") {
            throw new Error("Invalid input. Expect id:string, date:string");
        }

        const employee = await this.findById(id);
        if (!employee) {
            throw new Error('Employee not found');
        }

        const result = await punchRepository.set(id, employee.name, new Date(date));
        return { message: 'Punch set successfully', result };
    }
}

export default new employeeService();
