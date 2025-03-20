import express from 'express' 
import colors from 'colors'
import morgan from 'morgan'
import budgetRouter from './routes/routes';
import authRouter from './routes/auth.routes';

const app = express()

app.use(morgan('dev'))

app.use(express.json())

app.use('/api', budgetRouter);
app.use('/auth', authRouter);


export default app