import { IGroup } from '../models/Group';
import { FileStore } from '../utils/fileStore';
import { IUser } from '../models/User';

export class GroupRepository {
    private fileStore: FileStore;

    constructor() {
        this.fileStore = FileStore.getInstance();
    }

    async create(name: string, userId: string): Promise<IGroup> {
        return this.fileStore.create<IGroup>('groups', {
            name,
            createdBy: userId,
            members: [userId],
        } as any);
    }

    async findById(id: string): Promise<any | null> {
        const group = await this.fileStore.findById<IGroup>('groups', id);
        if (!group) return null;

        
        const members: any[] = [];
        for (const memberId of group.members) {
            const member = await this.fileStore.findById<IUser>('users', memberId);
            if (member) {
                
                members.push({ _id: member._id, name: member.name, email: member.email });
            }
        }

        return { ...group, members };
    }

    async findByUserId(userId: string): Promise<IGroup[]> {
        const groups = await this.fileStore.filter<IGroup>('groups', (group) =>
            group.members.includes(userId)
        );
        
        return groups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    async addMember(groupId: string, userId: string): Promise<any | null> {
        const group = await this.fileStore.findById<IGroup>('groups', groupId);
        if (!group) return null;

        if (!group.members.includes(userId)) {
            
            
            const newMembers = [...group.members, userId];
            await this.fileStore.update('groups', groupId, { members: newMembers });
        }

        return this.findById(groupId);
    }

    async removeMember(groupId: string, userId: string): Promise<any | null> {
        const group = await this.fileStore.findById<IGroup>('groups', groupId);
        if (!group) return null;

        const newMembers = group.members.filter(m => m !== userId);
        if (newMembers.length !== group.members.length) {
            await this.fileStore.update('groups', groupId, { members: newMembers });
        }

        return this.findById(groupId);
    }

    async delete(id: string): Promise<IGroup | null> {
        const group = await this.fileStore.findById<IGroup>('groups', id);
        if (group) {
            await this.fileStore.delete('groups', id);
            return group;
        }
        return null;
    }

    async isMember(groupId: string, userId: string): Promise<boolean> {
        const group = await this.fileStore.findById<IGroup>('groups', groupId);
        if (!group) return false;
        return group.members.includes(userId);
    }

    async isCreator(groupId: string, userId: string): Promise<boolean> {
        const group = await this.fileStore.findById<IGroup>('groups', groupId);
        if (!group) return false;
        return group.createdBy === userId;
    }
}
