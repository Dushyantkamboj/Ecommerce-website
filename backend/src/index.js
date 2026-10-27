
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';

import { userRoute } from './route/userRoute.js';
import { adminRoute } from './route/adminRoute.js';
import { productRoute } from './route/productRoute.js';
import "./model/association.js";

const app = express();

dotenv.config();

const port = process.env.PORT;
const api_v1 = process.env.API_VERSION;


app.use(cors());
app.use(express.json());

app.use(
  '/uploads',
  express.static(path.join(process.cwd(), 'uploads'))
);


app.use(`/${api_v1}/admin`, adminRoute);
app.use(`/${api_v1}/user`, userRoute);
app.use(`/${api_v1}/product`, productRoute);

app.get(`/${api_v1}`, (req, res) => {
  res.send('Hello world');
});

app.listen(`${port}`, () => {
  console.log(`The server runs on port ${port}`);
});
