import { ExpressData, ExpressStatus } from '../model/ExpressData';
import preferences from '@ohos.data.preferences';

const STORE_NAME = 'express_store';
const KEY_LIST = 'express_list';

export class ExpressStorage {
  private prefInstance: preferences.Preferences | null = null;

  async init(context: Context): Promise<void> {
    this.prefInstance = await preferences.getPreferences(context, STORE_NAME);
  }

  async getList(): Promise<ExpressData[]> {
    if (!this.prefInstance) return [];
    const data = await this.prefInstance.get(KEY_LIST, '[]') as string;
    return JSON.parse(data) as ExpressData[];
  }

  async addRecord(record: ExpressData): Promise<void> {
    const list = await this.getList();
    list.unshift(record);
    await this.saveList(list);
  }

  async updateRecord(id: string, updates: Partial<ExpressData>): Promise<void> {
    const list = await this.getList();
    const item = list.find(r => r.id === id);
    if (item) {
      Object.assign(item, updates);
      await this.saveList(list);
    }
  }

  async deleteRecord(id: string): Promise<void> {
    const list = (await this.getList()).filter(r => r.id !== id);
    await this.saveList(list);
  }

  async getById(id: string): Promise<ExpressData | null> {
    const list = await this.getList();
    return list.find(r => r.id === id) || null;
  }

  async getStats(): Promise<{ pending: number; picked: number; total: number }> {
    const list = await this.getList();
    return {
      pending: list.filter(r => r.status === ExpressStatus.PENDING).length,
      picked: list.filter(r => r.status === ExpressStatus.PICKED).length,
      total: list.length
    };
  }

  async getPendingList(): Promise<ExpressData[]> {
    const list = await this.getList();
    return list.filter(r => r.status === ExpressStatus.PENDING);
  }

  async getPickedList(): Promise<ExpressData[]> {
    const list = await this.getList();
    return list.filter(r => r.status === ExpressStatus.PICKED);
  }

  private async saveList(list: ExpressData[]): Promise<void> {
    if (!this.prefInstance) return;
    await this.prefInstance.put(KEY_LIST, JSON.stringify(list));
    await this.prefInstance.flush();
  }
}

export const expressStorage = new ExpressStorage();