import { Request, Response, NextFunction } from 'express';
import { GroupExpenseService } from '../services/GroupExpenseService';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/authMiddleware';
import { AppError } from '../utils/AppError';

export class GroupExpenseController {
    private groupExpenseService: GroupExpenseService;

    constructor() {
        this.groupExpenseService = new GroupExpenseService();
    }

    createGroupExpense = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.userId) {
            throw new AppError('User not authenticated', 401);
        }

        const { groupId, totalAmount, description } = req.body;

        if (!groupId || !totalAmount || !description) {
            throw new AppError('GroupId, totalAmount, and description are required', 400);
        }

        const expense = await this.groupExpenseService.createGroupExpense(
            req.userId,
            groupId,
            parseFloat(totalAmount),
            description
        );

        res.status(201).json({
            success: true,
            message: 'Group expense added and split successfully',
            data: expense,
        });
    });

    getGroupExpenses = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.userId) {
            throw new AppError('User not authenticated', 401);
        }

        const { groupId } = req.params;
        const expenses = await this.groupExpenseService.getGroupExpenses(req.userId, groupId);

        res.status(200).json({
            success: true,
            data: expenses,
        });
    });

    settleSplit = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.userId) {
            throw new AppError('User not authenticated', 401);
        }

        const { splitId } = req.params;
        const split = await this.groupExpenseService.settleSplit(req.userId, splitId);

        res.status(200).json({
            success: true,
            message: 'Split marked as settled',
            data: split,
        });
    });

    getMyDebts = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.userId) {
            throw new AppError('User not authenticated', 401);
        }

        const debts = await this.groupExpenseService.getMyDebts(req.userId);

        res.status(200).json({
            success: true,
            data: debts,
        });
    });

    getMyReceivables = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.userId) {
            throw new AppError('User not authenticated', 401);
        }

        const receivables = await this.groupExpenseService.getMyReceivables(req.userId);

        res.status(200).json({
            success: true,
            data: receivables,
        });
    });
}
