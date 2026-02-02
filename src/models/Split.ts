export interface ISplit {
    _id: string;
    groupExpenseId: string;
    userId: string;
    shareAmount: number;
    isSettled: boolean;
    createdAt: Date;
    updatedAt: Date;
}
