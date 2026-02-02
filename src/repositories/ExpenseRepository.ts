import { IExpense } from '../models/Expense';
import { FileStore } from '../utils/fileStore';

interface ExpenseFilters {
    category?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
}

interface PaginationOptions {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export class ExpenseRepository {
    private fileStore: FileStore;

    constructor() {
        this.fileStore = FileStore.getInstance();
    }

    async create(expenseData: Partial<IExpense>): Promise<IExpense> {
        // Safe cast as we assume partial has necessary fields or controller validates it
        return this.fileStore.create<IExpense>('expenses', expenseData as any);
    }

    async findById(id: string): Promise<IExpense | null> {
        return this.fileStore.findById<IExpense>('expenses', id);
    }

    async findByUserId(
        userId: string,
        filters: ExpenseFilters,
        pagination: PaginationOptions
    ): Promise<{ expenses: IExpense[]; total: number }> {
        const allExpenses = await this.fileStore.filter<IExpense>('expenses', (expense) => {
            if (expense.userId !== userId.toString()) return false;

            // Apply filters
            if (filters.category && expense.category !== filters.category) return false;

            const expenseDate = new Date(expense.date);
            if (filters.startDate && expenseDate < new Date(filters.startDate)) return false;
            if (filters.endDate && expenseDate > new Date(filters.endDate)) return false;

            if (filters.search) {
                const searchRegex = new RegExp(filters.search, 'i');
                if (!searchRegex.test(expense.title)) return false;
            }

            return true;
        });

        const total = allExpenses.length;

        // Sort
        const sortBy = pagination.sortBy || 'date';
        const sortOrder = pagination.sortOrder === 'asc' ? 1 : -1;

        allExpenses.sort((a: any, b: any) => {
            const valA = a[sortBy];
            const valB = b[sortBy];

            if (valA < valB) return -1 * sortOrder;
            if (valA > valB) return 1 * sortOrder;
            return 0;
        });

        // Paginate
        const startIndex = (pagination.page - 1) * pagination.limit;
        const endIndex = startIndex + pagination.limit;
        const expenses = allExpenses.slice(startIndex, endIndex);

        return { expenses, total };
    }

    async update(id: string, updateData: Partial<IExpense>): Promise<IExpense | null> {
        return this.fileStore.update<IExpense>('expenses', id, updateData);
    }

    async delete(id: string): Promise<IExpense | null> {
        const expense = await this.findById(id);
        if (expense) {
            await this.fileStore.delete('expenses', id);
            return expense;
        }
        return null;
    }

    async getMonthlySummary(userId: string, year: number): Promise<any[]> {
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31, 23, 59, 59);

        const expenses = await this.fileStore.filter<IExpense>('expenses', (expense) => {
            const expenseDate = new Date(expense.date);
            return expense.userId === userId.toString() &&
                expenseDate >= startOfYear &&
                expenseDate <= endOfYear;
        });

        const summaryMap = new Map<number, { totalAmount: number; count: number }>();

        expenses.forEach(expense => {
            const date = new Date(expense.date);
            const month = date.getMonth() + 1; // 1-12 match Mongo $month

            const current = summaryMap.get(month) || { totalAmount: 0, count: 0 };
            current.totalAmount += expense.amount;
            current.count += 1;
            summaryMap.set(month, current);
        });

        // Convert map to array and sort
        const result = Array.from(summaryMap.entries()).map(([month, data]) => ({
            _id: month,
            totalAmount: data.totalAmount,
            count: data.count
        }));

        result.sort((a, b) => a._id - b._id);
        return result;
    }
}
