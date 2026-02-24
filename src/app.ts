
import express from 'express';
import employeeRouter from './routes/employee';
import punchRouter  from './routes/punchEmployee';
import authRouter from './routes/auth';
import timeRouter from './routes/time';
import CORS from 'cors';

const app = express();

app.use(express.json());
app.use(CORS());

app.use('/auth', authRouter);
app.use('/employee', employeeRouter);
app.use('/punch', punchRouter);
app.use('/time', timeRouter);

export default app