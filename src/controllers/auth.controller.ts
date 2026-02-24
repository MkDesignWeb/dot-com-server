import { Request, Response } from 'express';
import userService from '../service/auth.service';


export const login = async (req: Request, res: Response) => {
  try {
    const { name, password } = req.body;
    const user = await userService.login(name, password)
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, password } = req.body;
    const result = await userService.signup(name, password);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
