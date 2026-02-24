import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { CreateEmployeeDTO } from '../types';
import employeeRepository from '../repository/employee.repository';
import employeeService from '../service/employee.service';

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const employee = await employeeService.create(req.body);
    res.status(201).json(employee);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const listEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await employeeService.list();
    res.json(employees);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const employees = await employeeService.delete(req.body.id);
    res.json(employees);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export const setPunch = async (req: Request, res: Response) => {
    try {
      const { id, date } = req.body;
      const result = await employeeService.setPunch(id, date);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
