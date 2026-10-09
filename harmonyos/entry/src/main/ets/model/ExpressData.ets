export interface ExpressData {
  id: string;
  station: string;
  code: string;
  courier: string;
  phone: string;
  status: ExpressStatus;
  createdAt: number;
  pickedAt: number | null;
  latitude?: number;
  longitude?: number;
}

export enum ExpressStatus {
  PENDING = 'pending',
  PICKED = 'picked'
}

export function createExpress(station: string, code: string, courier: string = '', phone: string = ''): ExpressData {
  return {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
    station,
    code,
    courier,
    phone,
    status: ExpressStatus.PENDING,
    createdAt: Date.now(),
    pickedAt: null
  };
}