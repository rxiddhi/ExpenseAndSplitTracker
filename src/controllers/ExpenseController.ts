import { Request, Response, NextFunction } from 'express';
import { ExpenseService } from '../services/ExpenseService';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/authMiddleware';
import { AppError } from '../utils/AppError';

export class ExpenseController {
    private expenseService: ExpenseService;

    constructor() {
        this.expenseService = new ExpenseService();
    }

    createExpense = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.userId) {
            throw new AppError('User not authenticated', 401);
        }

        const expense = await this.expenseService.createExpense(req.userId, req.body);

        res.status(201).json({
            success: true,
            message: 'Expense created successfully',
            data: expense,
        });
    });

    getExpenses = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.userId) {
            throw new AppError('User not authenticated', 401);
        }

        const result = await this.expenseService.getExpenses(req.userId, req.query);

        res.status(200).json({
            success: true,
            data: result.expenses,
            pagination: result.pagination,
        });
    });

    getExpenseById = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.userId) {
            throw new AppError('User not authenticated', 401);
        }

        const expense = await this.expenseService.getExpenseById(req.userId, req.params.id);

        res.status(200).json({
            success: true,
            data: expense,
        });
    });

    updateExpense = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.userId) {
            throw new AppError('User not authenticated', 401);
        }

        const expense = await this.expenseService.updateExpense(
            req.userId,
            req.params.id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: 'Expense updated successfully',
            data: expense,
        });
    });

    deleteExpense = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.userId) {
            throw new AppError('User not authenticated', 401);
        }

        await this.expenseService.deleteExpense(req.userId, req.params.id);

        res.status(200).json({
            success: true,
            message: 'Expense deleted successfully',
            data: null,
        });
    });

    getMonthlySummary = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.userId) {
            throw new AppError('User not authenticated', 401);
        }

        const year = parseInt(req.query.year as string) || new Date().getFullYear();
        const summary = await this.expenseService.getMonthlySummary(req.userId, year);

        res.status(200).json({
            success: true,
            data: summary,
        });
    });
}
