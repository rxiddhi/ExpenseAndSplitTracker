import { IUser } from '../models/User';
import { FileStore } from '../utils/fileStore';

export class AuthRepository {
    private fileStore: FileStore;

    constructor() {
        this.fileStore = FileStore.getInstance();
    }

    async createUser(email: string, password: string, name: string): Promise<IUser> {
        return this.fileStore.create<IUser>('users', { email, password, name });
    }

    async findUserByEmail(email: string): Promise<IUser | null> {
        return this.fileStore.findOne<IUser>('users', (user) => user.email === email);
    }

    async findUserById(userId: string): Promise<IUser | null> {
        return this.fileStore.findById<IUser>('users', userId);
    }

    async emailExists(email: string): Promise<boolean> {
        const user = await this.findUserByEmail(email);
        return !!user;
    }
}
