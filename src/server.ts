import express from 'express' 
import colors from 'colors'
import morgan from 'morgan'
import budgetRouter from './routes/routes';
import authRouter from './routes/auth.routes';
import cors from 'cors';

const app = express()

app.use(cors({
    origin: `${process.env.CLIENT_URL}`,  // o bien un array con tus orígenes permitidos
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // si manejas cookies, tokens, etc.
  }));

app.use(morgan('dev'))

app.use(express.json())

app.use('/api', budgetRouter);
app.use('/auth', authRouter);


export default app