import { IGroupExpense } from '../models/GroupExpense';
import { FileStore } from '../utils/fileStore';
import { IUser } from '../models/User';

export class GroupExpenseRepository {
    private fileStore: FileStore;

    constructor() {
        this.fileStore = FileStore.getInstance();
    }

    async create(expenseData: Partial<IGroupExpense>): Promise<IGroupExpense> {
        return this.fileStore.create<IGroupExpense>('groupExpenses', expenseData as any);
    }

    async findByGroupId(groupId: string): Promise<any[]> {
        const expenses = await this.fileStore.filter<IGroupExpense>('groupExpenses',
            (exp) => exp.groupId === groupId
        );

        // Sort desc
        expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Populate paidBy
        const populated = [];
        for (const exp of expenses) {
            const user = await this.fileStore.findById<IUser>('users', exp.paidBy);
            populated.push({
                ...exp,
                paidBy: user ? { _id: user._id, name: user.name, email: user.email } : exp.paidBy
            });
        }
        return populated;
    }

    async findById(id: string): Promise<any | null> {
        const exp = await this.fileStore.findById<IGroupExpense>('groupExpenses', id);
        if (!exp) return null;

        const user = await this.fileStore.findById<IUser>('users', exp.paidBy);
        return {
            ...exp,
            paidBy: user ? { _id: user._id, name: user.name, email: user.email } : exp.paidBy
        };
    }
}
