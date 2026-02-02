import express from 'express';
import cors from 'cors';
import path from 'path';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/authRoutes';
import expenseRoutes from './routes/expenseRoutes';
import groupRoutes from './routes/groupRoutes';
import groupExpenseRoutes from './routes/groupExpenseRoutes';
import { AppError } from './utils/AppError';

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));


app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/group-expenses', groupExpenseRoutes);


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});


app.all('*', (req, res, next) => {
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, '../public/index.html'));
    } else {
        next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
    }
});


app.use(errorHandler);

export default app;
