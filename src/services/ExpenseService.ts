import { ExpenseRepository } from '../repositories/ExpenseRepository';
import { IExpense } from '../models/Expense';
import { AppError } from '../utils/AppError';

export class ExpenseService {
    private expenseRepository: ExpenseRepository;

    constructor() {
        this.expenseRepository = new ExpenseRepository();
    }

    async createExpense(userId: string, data: Partial<IExpense>) {
        return this.expenseRepository.create({ ...data, userId } as any);
    }

    async getExpenses(
        userId: string,
        query: any
    ) {
        const page = parseInt(query.page as string) || 1;
        const limit = parseInt(query.limit as string) || 10;
        const sortBy = query.sortBy as string;
        const sortOrder = (query.sortOrder as 'asc' | 'desc') || 'desc';

        const filters = {
            category: query.category as string,
            startDate: query.startDate ? new Date(query.startDate as string) : undefined,
            endDate: query.endDate ? new Date(query.endDate as string) : undefined,
            search: query.search as string,
        };

        const result = await this.expenseRepository.findByUserId(
            userId,
            filters,
            { page, limit, sortBy, sortOrder }
        );

        return {
            expenses: result.expenses,
            pagination: {
                total: result.total,
                page,
                limit,
                pages: Math.ceil(result.total / limit),
            },
        };
    }

    async getExpenseById(userId: string, expenseId: string) {
        const expense = await this.expenseRepository.findById(expenseId);

        if (!expense) {
            throw new AppError('Expense not found', 404);
        }

        if (expense.userId.toString() !== userId) {
            throw new AppError('Not authorized to access this expense', 403);
        }

        return expense;
    }

    async updateExpense(userId: string, expenseId: string, data: Partial<IExpense>) {
        const expense = await this.getExpenseById(userId, expenseId);

        const updatedExpense = await this.expenseRepository.update(expenseId, data);
        return updatedExpense;
    }

    async deleteExpense(userId: string, expenseId: string) {
        const expense = await this.getExpenseById(userId, expenseId);

        await this.expenseRepository.delete(expenseId);
        return null;
    }

    async getMonthlySummary(userId: string, year: number) {
        const summary = await this.expenseRepository.getMonthlySummary(userId, year);

        
        const formattedSummary = Array.from({ length: 12 }, (_, i) => {
            const monthData = summary.find(item => item._id === i + 1);
            return {
                month: i + 1,
                totalAmount: monthData ? monthData.totalAmount : 0,
                count: monthData ? monthData.count : 0
            };
        });

        return formattedSummary;
    }
}
