import { Request, Response } from 'express';
import punchService from '../service/punch.service';



export const setPunchEmployee = async (req: Request, res: Response) => {
  try {
    const { employeeId, password } = req.body;
    const result = await punchService.set(employeeId, password);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getPunchEmployee = async (req: Request, res: Response) => {
  if(!req.query.employeeId || typeof req.query.employeeId !== 'string') {
    return res.status(400).json({ error: 'employeeId query parameter is required and must be a string' });
  }
  try {
    const { employeeId, time } = req.query;
    const result = await punchService.get(employeeId, time as "day" | "all");
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
