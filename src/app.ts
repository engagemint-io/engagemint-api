import 'express-async-errors';
import express, { json } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import routes from './routes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(json());
app.use(helmet());
app.use(cors());
app.use(routes);

app.use(express.urlencoded({ extended: true }));

app.use((_, res) => {
  res.sendStatus(404);
});

export { app };
