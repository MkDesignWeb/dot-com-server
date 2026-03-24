import { prisma } from "../data/data.config";
import { CreateEmployeeDTO } from "../types";

class EmployeeRepository {

  async create(employeeData: CreateEmployeeDTO) {
    return await prisma.employee.create({
      data: employeeData
    });
  }

  async list() {
    return await prisma.employee.findMany();
  }

  async findById(id: string | number) {
    return await prisma.employee.findUnique({
      where: { id: Number(id) }
    });
  }

  async findByName(name: string) {
    return await prisma.employee.findFirst({
      where: { name: name }
    });
  }

  async delete(id: string | number) {
    return await prisma.employee.delete({
      where: { id: Number(id) }
    });
  }
}

export default new EmployeeRepository();