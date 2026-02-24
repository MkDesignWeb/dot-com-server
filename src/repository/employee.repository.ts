import employeeModel from "../models/employee.model";
import { CreateEmployeeDTO } from "../types";

class EmployeeRepository {

  async create(employeeData: CreateEmployeeDTO) {
    return await employeeModel.create(employeeData);
  }

  async list() {
    return await employeeModel.find();
  }

  async findById(id: string) {
    return await employeeModel.findById(id);
  }

  async delete(id: string) {
    return await employeeModel.findByIdAndDelete(id);
  }
}

export default new EmployeeRepository();