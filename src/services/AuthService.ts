import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRepository } from '../repositories/AuthRepository';
import { AppError } from '../utils/AppError';

export class AuthService {
    private authRepository: AuthRepository;

    constructor() {
        this.authRepository = new AuthRepository();
    }

    async register(email: string, password: string, name: string) {
        
        const existingUser = await this.authRepository.emailExists(email);
        if (existingUser) {
            throw new AppError('Email already registered', 400);
        }

        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        
        const user = await this.authRepository.createUser(email, hashedPassword, name);

        
        const token = this.generateToken(user._id.toString());

        return {
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
            },
            token,
        };
    }

    async login(email: string, password: string) {
        
        const user = await this.authRepository.findUserByEmail(email);
        if (!user || !user.password) {
            throw new AppError('Invalid credentials', 401);
        }

        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new AppError('Invalid credentials', 401);
        }

        
        const token = this.generateToken(user._id.toString());

        return {
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
            },
            token,
        };
    }

    private generateToken(userId: string): string {
        const secret = process.env.JWT_SECRET || 'development-secret-key-12345';
        const token = jwt.sign({ userId }, secret, {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        });
        return token;
    }
}
