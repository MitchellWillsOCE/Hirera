import { Prisma } from '@/generated/prisma';

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

// Simple in-memory cache
const cache = new Map<string, { value: any; expiry: number }>();

function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expiry) {
    return entry.value as T;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, value: any, ttlSeconds: number = 60): void {
  const expiry = Date.now() + ttlSeconds * 1000;
  cache.set(key, { value, expiry });
}

function clearCache(keyOrPrefix: string): void {
  if (keyOrPrefix.endsWith(':*') || keyOrPrefix.endsWith('*')) {
    const prefix = keyOrPrefix.replace(/:\*|(\*)$/, '');
    for (const key of cache.keys()) {
      if (key.startsWith(prefix)) {
        cache.delete(key);
      }
    }
  } else {
    cache.delete(keyOrPrefix);
  }
}

export abstract class BaseService {
  protected model: any;

  constructor(model: any) {
    this.model = model;
  }

  protected success<T>(data: T): ServiceResponse<T> {
    return { success: true, data };
  }

  protected handleError(error: any): ServiceResponse<any> {
    console.error('Service Error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle known Prisma errors
      switch (error.code) {
        case 'P2002':
          return { success: false, error: `A unique constraint failed on the ${error.meta?.target}`, code: 'UNIQUE_CONSTRAINT_FAILED' };
        case 'P2025':
          return { success: false, error: 'Record not found', code: 'NOT_FOUND' };
        default:
          return { success: false, error: 'A database error occurred', code: 'DB_ERROR' };
      }
    }
    
    // Handle generic errors
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred', 
      code: 'UNEXPECTED_ERROR' 
    };
  }

  protected async getCached<T>(key: string): Promise<T | null> {
    return getCache<T>(key);
  }

  protected async setCache(key: string, value: any, ttlSeconds?: number): Promise<void> {
    setCache(key, value, ttlSeconds);
  }

  protected async clearCache(keyOrPrefix: string): Promise<void> {
    clearCache(keyOrPrefix);
  }
} 