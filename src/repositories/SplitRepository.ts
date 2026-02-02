import { ISplit } from '../models/Split';
import { IGroupExpense } from '../models/GroupExpense';
import { IUser } from '../models/User';
import { FileStore } from '../utils/fileStore';

export class SplitRepository {
    private fileStore: FileStore;

    constructor() {
        this.fileStore = FileStore.getInstance();
    }

    async createSplits(splits: Partial<ISplit>[]): Promise<ISplit[]> {
        const createdSplits: ISplit[] = [];
        for (const split of splits) {
            const created = await this.fileStore.create<ISplit>('splits', split as any);
            createdSplits.push(created);
        }
        return createdSplits;
    }

    async findUnsettledByUserId(userId: string): Promise<any[]> {
        const splits = await this.fileStore.filter<ISplit>('splits',
            s => s.userId === userId && !s.isSettled
        );

        // Populate groupExpense -> paidBy
        const populated = [];
        for (const split of splits) {
            const expense = await this.fileStore.findById<IGroupExpense>('groupExpenses', split.groupExpenseId);
            let expensePopulated = null;

            if (expense) {
                const paidByUser = await this.fileStore.findById<IUser>('users', expense.paidBy);
                expensePopulated = {
                    ...expense,
                    paidBy: paidByUser ? { _id: paidByUser._id, name: paidByUser.name, email: paidByUser.email } : expense.paidBy
                };
            }

            populated.push({
                ...split,
                groupExpenseId: expensePopulated
            });
        }

        return populated;
    }

    async findUnsettledReceivables(userId: string): Promise<any[]> {
        // 1. Find all expenses paid by me
        const myExpenses = await this.fileStore.filter<IGroupExpense>('groupExpenses',
            exp => exp.paidBy === userId
        );
        const myExpenseIds = myExpenses.map(e => e._id);

        // 2. Find all unsettled splits for these expenses where debtor != me
        const splits = await this.fileStore.filter<ISplit>('splits',
            s => myExpenseIds.includes(s.groupExpenseId) &&
                !s.isSettled &&
                s.userId !== userId
        );

        // 3. Populate expense and debtor
        const populated = [];
        for (const split of splits) {
            const expense = myExpenses.find(e => e._id === split.groupExpenseId);
            const debtor = await this.fileStore.findById<IUser>('users', split.userId);

            populated.push({
                ...split,
                expense: expense, // already fully loaded object (simplification)
                debtor: debtor ? { _id: debtor._id, name: debtor.name, email: debtor.email } : null
            });
        }

        return populated;
    }

    async markAsSettled(splitId: string): Promise<ISplit | null> {
        return this.fileStore.update<ISplit>('splits', splitId, { isSettled: true });
    }

    async findByExpenseId(expenseId: string): Promise<any[]> {
        const splits = await this.fileStore.filter<ISplit>('splits',
            s => s.groupExpenseId === expenseId
        );

        const populated = [];
        for (const split of splits) {
            const user = await this.fileStore.findById<IUser>('users', split.userId);
            populated.push({
                ...split,
                userId: user ? { _id: user._id, name: user.name, email: user.email } : split.userId
            });
        }

        return populated;
    }
}
