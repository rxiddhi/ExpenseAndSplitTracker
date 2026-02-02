import fs from 'fs/promises';
import path from 'path';

// Generic interface for items stored in the file
export interface BaseItem {
    _id: string; // Mimic MongoDB _id
    createdAt: Date;
    updatedAt: Date;
    [key: string]: any;
}

export class FileStore {
    private static instance: FileStore;
    private dbPath: string;
    private data: Record<string, BaseItem[]> = {};

    private constructor() {
        this.dbPath = path.join(process.cwd(), 'data.json');
        this.loadData();
    }

    public static getInstance(): FileStore {
        if (!FileStore.instance) {
            FileStore.instance = new FileStore();
        }
        return FileStore.instance;
    }

    private async loadData() {
        try {
            const data = await fs.readFile(this.dbPath, 'utf-8');
            this.data = JSON.parse(data, (key, value) => {
                // Revive dates
                if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*/.test(value)) {
                    return new Date(value);
                }
                return value;
            });
        } catch (error) {
            // If file doesn't exist, start with empty data
            this.data = {};
            await this.saveData();
        }
    }

    private async saveData() {
        await fs.writeFile(this.dbPath, JSON.stringify(this.data, null, 2));
    }

    public async findAll<T extends BaseItem>(collection: string): Promise<T[]> {
        await this.loadData();
        return (this.data[collection] || []) as T[];
    }

    public async findById<T extends BaseItem>(collection: string, id: string): Promise<T | null> {
        await this.loadData();
        const items = this.data[collection] || [];
        return (items.find(item => item._id === id) as T) || null;
    }

    public async findOne<T extends BaseItem>(collection: string, predicate: (item: T) => boolean): Promise<T | null> {
        await this.loadData();
        const items = (this.data[collection] || []) as T[];
        return items.find(predicate) || null;
    }

    public async filter<T extends BaseItem>(collection: string, predicate: (item: T) => boolean): Promise<T[]> {
        await this.loadData();
        const items = (this.data[collection] || []) as T[];
        return items.filter(predicate);
    }

    public async create<T extends BaseItem>(collection: string, item: Omit<T, '_id' | 'createdAt' | 'updatedAt'>): Promise<T> {
        await this.loadData();
        const newItem = {
            ...item,
            _id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            createdAt: new Date(),
            updatedAt: new Date(),
        } as T;

        if (!this.data[collection]) {
            this.data[collection] = [];
        }
        this.data[collection].push(newItem);
        await this.saveData();
        return newItem;
    }

    public async update<T extends BaseItem>(collection: string, id: string, updates: Partial<T>): Promise<T | null> {
        await this.loadData();
        const items = this.data[collection] || [];
        const index = items.findIndex(item => item._id === id);

        if (index === -1) return null;

        const updatedItem = {
            ...items[index],
            ...updates,
            updatedAt: new Date()
        };

        this.data[collection][index] = updatedItem;
        await this.saveData();
        return updatedItem as T;
    }

    public async delete(collection: string, id: string): Promise<boolean> {
        await this.loadData();
        const items = this.data[collection] || [];
        const index = items.findIndex(item => item._id === id);

        if (index === -1) return false;

        this.data[collection].splice(index, 1);
        await this.saveData();
        return true;
    }
    
    // Helper to simulate basic query matching
    public matchesQuery(item: any, query: any): boolean {
        for (const key in query) {
            const value = query[key];
             if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
                // Handle operators like $gte, $lte, $regex
                if (value.$gte && !(new Date(item[key]) >= new Date(value.$gte))) return false;
                if (value.$lte && !(new Date(item[key]) <= new Date(value.$lte))) return false;
                if (value.$regex && !new RegExp(value.$regex, value.$options).test(item[key])) return false;
            } else if (item[key] !== value) {
                return false;
            }
        }
        return true;
    }
}
