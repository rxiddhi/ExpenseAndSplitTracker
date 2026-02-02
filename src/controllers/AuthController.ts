import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { email, password, name } = req.body;

        // Validation
        if (!email || !password || !name) {
            throw new AppError('Please provide email, password, and name', 400);
        }

        const result = await this.authService.register(email, password, name);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: result,
        });
    });

    login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            throw new AppError('Please provide email and password', 400);
        }

        const result = await this.authService.login(email, password);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: result,
        });
    });
}
