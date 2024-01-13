import * as dotenv from 'dotenv';
import { app } from './app';

dotenv.config();
const port = 3001;

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
