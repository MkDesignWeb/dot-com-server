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
  const { employeeId, month, year } = req.query;

  if (!employeeId || typeof employeeId !== 'string') {
    return res.status(400).json({ error: 'employeeId query parameter is required and must be a string' });
  }

  const parsedMonth = Number(month);
  const parsedYear = Number(year);

  if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
    return res.status(400).json({ error: 'month query parameter is required and must be an integer between 1 and 12' });
  }

  if (!Number.isInteger(parsedYear) || parsedYear < 1) {
    return res.status(400).json({ error: 'year query parameter is required and must be a positive integer' });
  }

  try {
    const result = await punchService.get(employeeId, parsedMonth, parsedYear);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const updatePunchEmployee = async (req: Request, res: Response) => {
  const { punchId } = req.params;
  const { timeStamp } = req.body;

  try {
    const result = await punchService.updateTime(punchId, timeStamp);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deletePunchEmployee = async (req: Request, res: Response) => {
  const { punchId } = req.params;

  try {
    const result = await punchService.delete(punchId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
