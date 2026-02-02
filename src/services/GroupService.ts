import { GroupRepository } from '../repositories/GroupRepository';
import { AuthRepository } from '../repositories/AuthRepository';
import { AppError } from '../utils/AppError';

export class GroupService {
    private groupRepository: GroupRepository;
    private authRepository: AuthRepository;

    constructor() {
        this.groupRepository = new GroupRepository();
        this.authRepository = new AuthRepository();
    }

    async createGroup(userId: string, name: string) {
        return this.groupRepository.create(name, userId);
    }

    async getGroups(userId: string) {
        return this.groupRepository.findByUserId(userId);
    }

    async getGroupById(userId: string, groupId: string) {
        const isMember = await this.groupRepository.isMember(groupId, userId);

        if (!isMember) {
            throw new AppError('Not authorized to access this group', 403);
        }

        const group = await this.groupRepository.findById(groupId);
        if (!group) {
            throw new AppError('Group not found', 404);
        }

        return group;
    }

    async addMember(userId: string, groupId: string, emailToAdd: string) {
        // Check if requester is creator
        const isCreator = await this.groupRepository.isCreator(groupId, userId);
        if (!isCreator) {
            throw new AppError('Only group creator can add members', 403);
        }

        // Find user to add
        const userToAdd = await this.authRepository.findUserByEmail(emailToAdd);
        if (!userToAdd) {
            throw new AppError('User with this email not found', 404);
        }

        // Check if already a member
        const isMember = await this.groupRepository.isMember(groupId, userToAdd._id.toString());
        if (isMember) {
            throw new AppError('User is already a member of this group', 400);
        }

        return this.groupRepository.addMember(groupId, userToAdd._id.toString());
    }

    async removeMember(userId: string, groupId: string, userIdToRemove: string) {
        // Check if requester is creator
        const isCreator = await this.groupRepository.isCreator(groupId, userId);

        // Allow users to leave group themselves, or creator to remove others
        if (!isCreator && userId !== userIdToRemove) {
            throw new AppError('Not authorized to remove this member', 403);
        }

        // Cannot remove creator
        const isTargetCreator = await this.groupRepository.isCreator(groupId, userIdToRemove);
        if (isTargetCreator) {
            throw new AppError('Cannot remove group creator', 400);
        }

        return this.groupRepository.removeMember(groupId, userIdToRemove);
    }

    async deleteGroup(userId: string, groupId: string) {
        const isCreator = await this.groupRepository.isCreator(groupId, userId);
        if (!isCreator) {
            throw new AppError('Only creator can delete the group', 403);
        }

        /* 
          TODO: Ideally we should also delete all expenses associated with this group
          or prevent deletion if expenses exist.
          For simplicity in this task, we'll just delete the group.
        */

        return this.groupRepository.delete(groupId);
    }
}
