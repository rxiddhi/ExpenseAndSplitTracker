export interface IExpense {
    _id: string;
    userId: string;
    title: string;
    amount: number;
    category: string;
    date: Date;
    paymentMethod: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
