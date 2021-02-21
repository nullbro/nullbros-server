import express from 'express';
import cors from 'cors';
import { apollo } from './apollo';
import cookieParser from 'cookie-parser';
import router from './route';

const app = express();

const origin =
	process.env.NODE_ENV === 'production' ? 'https://nullbros.com' : 'http://localhost:3000';

app.use(cors({ credentials: true, origin: origin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', router);
apollo.applyMiddleware({ app, cors: false });

export default app;
