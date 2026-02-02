import { GroupExpenseRepository } from '../repositories/GroupExpenseRepository';
import { SplitRepository } from '../repositories/SplitRepository';
import { GroupRepository } from '../repositories/GroupRepository';
import { AppError } from '../utils/AppError';

export class GroupExpenseService {
    private groupExpenseRepository: GroupExpenseRepository;
    private splitRepository: SplitRepository;
    private groupRepository: GroupRepository;

    constructor() {
        this.groupExpenseRepository = new GroupExpenseRepository();
        this.splitRepository = new SplitRepository();
        this.groupRepository = new GroupRepository();
    }

    async createGroupExpense(userId: string, groupId: string, amount: number, description: string) {
        // 1. Verify group membership
        const isMember = await this.groupRepository.isMember(groupId, userId);
        if (!isMember) {
            throw new AppError('Not authorized to add expense to this group', 403);
        }

        const group = await this.groupRepository.findById(groupId);
        if (!group) throw new AppError('Group not found', 404);

        // 2. Create Group Expense
        const expense = await this.groupExpenseRepository.create({
            groupId: groupId,
            paidBy: userId,
            totalAmount: amount,
            description,
            date: new Date()
        });

        // 3. Calculate Splits
        // Equal split logic: Total / Number of members
        const memberCount = group.members.length; // members is mixed strings/objects depending on findById implementation.
        // Wait, GroupRepository.findById populates members. So they are objects.
        // I need to be careful.
        // group.members is "any".

        if (memberCount === 0) return expense;

        const shareAmount = parseFloat((amount / memberCount).toFixed(2));

        const splits = group.members.map((member: any) => {
            const memberId = member._id || member; // Handle both populated and unpopulated
            return {
                groupExpenseId: expense._id,
                userId: memberId.toString(),
                shareAmount,
                isSettled: memberId.toString() === userId.toString()
            };
        });

        await this.splitRepository.createSplits(splits);

        return expense;
    }

    async getGroupExpenses(userId: string, groupId: string) {
        const isMember = await this.groupRepository.isMember(groupId, userId);
        if (!isMember) {
            throw new AppError('Not authorized to view expenses of this group', 403);
        }

        const expenses = await this.groupExpenseRepository.findByGroupId(groupId);
        return expenses;
    }

    async settleSplit(userId: string, splitId: string) {
        const split = await this.splitRepository.markAsSettled(splitId);
        return split;
    }

    async getMyDebts(userId: string) {
        const debts = await this.splitRepository.findUnsettledByUserId(userId);

        return debts
            .filter(split => {
                const expense = split.groupExpenseId as any;
                // expense.paidBy is populated object
                return expense.paidBy._id.toString() !== userId;
            })
            .map(split => {
                const expense = split.groupExpenseId as any;
                return {
                    splitId: split._id,
                    amount: split.shareAmount,
                    description: expense.description,
                    date: expense.date,
                    owedTo: expense.paidBy
                };
            });
    }

    async getMyReceivables(userId: string) {
        const receivables = await this.splitRepository.findUnsettledReceivables(userId);

        return receivables.map((item: any) => ({
            splitId: item._id,
            amount: item.shareAmount,
            description: item.expense.description,
            date: item.expense.date,
            owedBy: item.debtor
        }));
    }
}
