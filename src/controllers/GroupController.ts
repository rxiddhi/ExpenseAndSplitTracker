import { Request, Response, NextFunction } from 'express';
import { GroupService } from '../services/GroupService';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/authMiddleware';
import { AppError } from '../utils/AppError';

export class GroupController {
    private groupService: GroupService;

    constructor() {
        this.groupService = new GroupService();
    }

    createGroup = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.userId) {
            throw new AppError('User not authenticated', 401);
        }

        const { name } = req.body;
        if (!name) {
            throw new AppError('Group name is required', 400);
        }

        const group = await this.groupService.createGroup(req.userId, name);

        res.status(201).json({
            success: true,
            message: 'Group created successfully',
            data: group,
        });
    });

    getGroups = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.userId) {
            throw new AppError('User not authenticated', 401);
        }

        const groups = await this.groupService.getGroups(req.userId);

        res.status(200).json({
            success: true,
            data: groups,
        });
    });

    getGroupById = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.userId) {
            throw new AppError('User not authenticated', 401);
        }

        const group = await this.groupService.getGroupById(req.userId, req.params.id);

        res.status(200).json({
            success: true,
            data: group,
        });
    });

    addMember = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.userId) {
            throw new AppError('User not authenticated', 401);
        }

        const { email } = req.body;
        if (!email) {
            throw new AppError('Member email is required', 400);
        }

        const group = await this.groupService.addMember(req.userId, req.params.id, email);

        res.status(200).json({
            success: true,
            message: 'Member added successfully',
            data: group,
        });
    });

    removeMember = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.userId) {
            throw new AppError('User not authenticated', 401);
        }

        const userIdToRemove = req.params.userId;
        const group = await this.groupService.removeMember(req.userId, req.params.id, userIdToRemove);

        res.status(200).json({
            success: true,
            message: 'Member removed successfully',
            data: group,
        });
    });

    deleteGroup = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.userId) {
            throw new AppError('User not authenticated', 401);
        }

        await this.groupService.deleteGroup(req.userId, req.params.id);

        res.status(200).json({
            success: true,
            message: 'Group deleted successfully',
            data: null,
        });
    });
}
