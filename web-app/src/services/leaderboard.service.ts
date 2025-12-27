import { BaseService, ServiceResponse } from '@/lib/base.service';

interface LeaderboardUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  country: string;
  totalApplications: number;
  successRate: number;
  interviewRate: number;
  offerCount: number;
  avgResponseTime: number;
  lastActive: Date;
  rank: number;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function metricKey(metric: string) {
  switch (metric) {
    case 'applications':
    case 'totalApps':
      return 'totalApplications';
    case 'success':
      return 'successRate';
    case 'interviews':
      return 'interviewRate';
    case 'offers':
      return 'offerCount';
    case 'speed':
      return 'avgResponseTime';
    default:
      return 'totalApplications';
  }
}

export class LeaderboardService extends BaseService {
  constructor() {
    super(null);
  }

  async getLeaderboard(
    currentUserId: string,
    metric: string,
    period: string,
    country?: string,
    limit: number = 10
  ): Promise<ServiceResponse<any>> {
    try {
      const safeLimit = clamp(Number(limit) || 10, 1, 50);
      const filterCountry = country && country !== 'all' ? country : undefined;

      const seed = seedFromString(`${metric}|${period}|${filterCountry || 'all'}`);
      const rand = mulberry32(seed);

      const roster = [
        { firstName: 'Ava', lastName: 'Chen', country: 'AU' },
        { firstName: 'Liam', lastName: 'Patel', country: 'IN' },
        { firstName: 'Noah', lastName: 'Smith', country: 'US' },
        { firstName: 'Emma', lastName: 'Martin', country: 'FR' },
        { firstName: 'Olivia', lastName: 'MÃ¼ller', country: 'DE' },
        { firstName: 'Sofia', lastName: 'Brown', country: 'GB' },
        { firstName: 'Mia', lastName: 'Wilson', country: 'CA' },
        { firstName: 'Ethan', lastName: 'Jones', country: 'US' },
        { firstName: 'Lucas', lastName: 'Garcia', country: 'US' },
        { firstName: 'Isla', lastName: 'Taylor', country: 'AU' },
      ];

      const users: LeaderboardUser[] = Array.from({ length: 50 }, (_, i) => {
        const base = roster[i % roster.length];
        const totalApplications = Math.floor(rand() * 120);
        const successRate = clamp(Math.floor(rand() * 60) + 20, 0, 100);
        const interviewRate = clamp(Math.floor(rand() * 70) + 10, 0, 100);
        const offerCount = clamp(Math.floor(totalApplications * (rand() * 0.12)), 0, 15);
        const avgResponseTime = clamp(Math.floor(rand() * 18) + 2, 1, 45);
        const lastActive = new Date(Date.now() - Math.floor(rand() * 14) * 24 * 60 * 60 * 1000);

        return {
          id: `user-${i}`,
          username: `hirera_user_${String(i).padStart(2, '0')}`,
          firstName: base.firstName,
          lastName: base.lastName,
          country: base.country,
          totalApplications,
          successRate,
          interviewRate,
          offerCount,
          avgResponseTime,
          lastActive,
          rank: 0,
        };
      }).filter((u) => (filterCountry ? u.country === filterCountry : true));

      const sortField = metricKey(metric);
      const sorted = [...users].sort((a, b) => {
        if (sortField === 'avgResponseTime') {
          return a.avgResponseTime - b.avgResponseTime;
        }
        return (b as any)[sortField] - (a as any)[sortField];
      });

      sorted.forEach((u, idx) => (u.rank = idx + 1));

      const currentUser: LeaderboardUser | null = sorted.length
        ? { ...sorted[Math.floor(rand() * sorted.length)], id: currentUserId, username: 'you' }
        : null;

      const avgApplications =
        sorted.length > 0
          ? Math.round(sorted.reduce((sum, u) => sum + u.totalApplications, 0) / sorted.length)
          : 0;

      const avgSuccessRate =
        sorted.length > 0
          ? Math.round(sorted.reduce((sum, u) => sum + u.successRate, 0) / sorted.length)
          : 0;

      const summary = {
        totalUsers: sorted.length,
        avgApplications,
        avgSuccessRate,
        period,
        metric,
        country: filterCountry || 'all',
      };

      return this.success({
        leaderboard: sorted.slice(0, safeLimit),
        currentUser,
        summary,
      });
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const leaderboardService = new LeaderboardService();
