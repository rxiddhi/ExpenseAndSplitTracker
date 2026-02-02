export interface IGroup {
    _id: string;
    name: string;
    createdBy: string;
    members: string[];
    createdAt: Date;
    updatedAt: Date;
}
