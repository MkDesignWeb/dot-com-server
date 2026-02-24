import { Request, Response } from 'express';
import timeService from '../service/time.service';


export const getTime = async (req: Request, res: Response) => {
  try {
    const time = await timeService.getTime();
    res.json(time);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
