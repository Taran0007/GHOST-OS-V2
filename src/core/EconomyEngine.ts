import { ViewerProfile, ViewerBusiness } from '../types';
import { EventBus } from './EventBus';

const INITIAL_VIEWERS: ViewerProfile[] = [
  {
    id: 'v-1',
    username: 'GhostRider99',
    platform: 'twitch',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    watchTimeHours: 142,
    totalMessages: 890,
    points: 15400,
    xp: 4200,
    level: 18,
    job: '🚕 Taxi Fleet Owner',
    businesses: [
      { id: 'b-1', name: 'Ghost Cab Co.', type: 'taxi', level: 3, dailyIncome: 1200, upgradeCost: 5000 },
    ],
    inventory: ['VIP Pass', 'Gold Wheel Ticket', 'Custom Voice Modifier'],
    achievements: ['First Chat', 'Top Watcher', 'Nightclub Mogul', '100 Hours Club'],
    lastSeen: 'Just now',
    notes: 'Regular loyal sub. Loves GTA RP streams.',
  },
  {
    id: 'v-2',
    username: 'CyberNinja_X',
    platform: 'kick',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    watchTimeHours: 88,
    totalMessages: 412,
    points: 8900,
    xp: 2600,
    level: 12,
    job: '🔧 Chief Mechanic',
    businesses: [
      { id: 'b-2', name: 'Downtown Customs', type: 'mechanic', level: 2, dailyIncome: 850, upgradeCost: 3500 },
    ],
    inventory: ['Mechanic Wrench', 'Silver Wheel Ticket'],
    achievements: ['First Chat', 'Wheel Lucky', 'Customs Master'],
    lastSeen: '5 mins ago',
  },
  {
    id: 'v-3',
    username: 'PixelQueen',
    platform: 'youtube',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    watchTimeHours: 210,
    totalMessages: 1450,
    points: 32000,
    xp: 7800,
    level: 28,
    job: '🍸 Nightclub Owner',
    businesses: [
      { id: 'b-3', name: 'Neon Horizon Club', type: 'nightclub', level: 5, dailyIncome: 3500, upgradeCost: 12000 },
      { id: 'b-4', name: 'High Roller Casino', type: 'casino', level: 2, dailyIncome: 2100, upgradeCost: 9000 },
    ],
    inventory: ['VIP Platinum Card', 'Diamond Wheel Ticket', 'AI Co-host Voice Lock'],
    achievements: ['First Chat', 'Millionaire', 'Nightclub Mogul', 'Chat Legend', 'Giveaway Champ'],
    lastSeen: '1 min ago',
  },
  {
    id: 'v-4',
    username: 'ViperGamer_99',
    platform: 'discord',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80',
    watchTimeHours: 45,
    totalMessages: 230,
    points: 3400,
    xp: 1100,
    level: 6,
    job: '💻 Tech Startup CEO',
    businesses: [
      { id: 'b-5', name: 'Viper AI Labs', type: 'tech_co', level: 1, dailyIncome: 500, upgradeCost: 2500 },
    ],
    inventory: ['Starter Pass'],
    achievements: ['First Chat', 'Tech Pioneer'],
    lastSeen: '12 mins ago',
  },
];

class EconomyEngineService {
  private viewers: Map<string, ViewerProfile> = new Map();

  constructor() {
    INITIAL_VIEWERS.forEach((v) => this.viewers.set(v.id, { ...v }));
  }

  public getViewers(): ViewerProfile[] {
    return Array.from(this.viewers.values());
  }

  public getViewer(id: string): ViewerProfile | undefined {
    return this.viewers.get(id);
  }

  public addPoints(viewerId: string, amount: number, reason: string): void {
    const v = this.viewers.get(viewerId);
    if (v) {
      v.points += amount;
      v.xp += Math.floor(amount / 2);
      v.level = Math.floor(v.xp / 300) + 1;
      EventBus.emit('RewardClaimed', 'EconomyEngine', {
        username: v.username,
        amount,
        reason,
        newPoints: v.points,
      });
    }
  }

  public addViewerPoints(username: string, amount: number): void {
    const v = Array.from(this.viewers.values()).find(
      (item) => item.username.toLowerCase() === username.toLowerCase()
    );
    if (v) {
      v.points += amount;
    }
  }

  public buyBusiness(viewerId: string, businessName: string, type: ViewerBusiness['type'], cost: number, dailyIncome: number): boolean {
    const v = this.viewers.get(viewerId);
    if (v && v.points >= cost) {
      v.points -= cost;
      const newBiz: ViewerBusiness = {
        id: `biz_${Date.now()}`,
        name: businessName,
        type,
        level: 1,
        dailyIncome,
        upgradeCost: Math.floor(cost * 1.5),
      };
      v.businesses.push(newBiz);
      EventBus.emit('RewardClaimed', 'EconomyEngine', {
        username: v.username,
        action: `Purchased Business: ${businessName}`,
      });
      return true;
    }
    return false;
  }

  public collectDailyRevenue(viewerId: string): number {
    const v = this.viewers.get(viewerId);
    if (v) {
      const totalIncome = v.businesses.reduce((sum, b) => sum + b.dailyIncome, 0);
      v.points += totalIncome;
      return totalIncome;
    }
    return 0;
  }
}

export const EconomyEngine = new EconomyEngineService();
