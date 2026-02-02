export interface IGroupExpense {
    _id: string;
    groupId: string;
    paidBy: string;
    totalAmount: number;
    description: string;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
}
