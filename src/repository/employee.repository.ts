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

  async findByName(name: string) {
    return await employeeModel.findOne({ name: new RegExp('^' + name + '$', 'i') });
  }

  async delete(id: string) {
    return await employeeModel.findByIdAndDelete(id);
  }
}

export default new EmployeeRepository();