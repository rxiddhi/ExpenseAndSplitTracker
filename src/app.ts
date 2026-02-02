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

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/group-expenses', groupExpenseRoutes);

// Serve frontend for any unknown route (SPA-like behavior fallback, though we have specific html files)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Handle 404
app.all('*', (req, res, next) => {
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, '../public/index.html'));
    } else {
        next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
    }
});

// Global Error Handler
app.use(errorHandler);

export default app;
