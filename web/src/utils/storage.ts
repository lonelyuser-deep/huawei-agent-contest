import type { ExpressData } from '@shared/types/express'
import { createExpress } from '@shared/types/express'

const KEY = 'express_list'

export function getList(): ExpressData[] {
  const data = localStorage.getItem(KEY)
  return data ? JSON.parse(data) : []
}

export function addRecord(station: string, code: string, courier: string = '', phone: string = ''): ExpressData {
  const list = getList()
  const record = createExpress(station, code, courier, phone)
  list.unshift(record)
  saveList(list)
  return record
}

export function updateRecord(id: string, updates: Partial<ExpressData>): void {
  const list = getList()
  const item = list.find(r => r.id === id)
  if (item) {
    Object.assign(item, updates)
    saveList(list)
  }
}

export function deleteRecord(id: string): void {
  saveList(getList().filter(r => r.id !== id))
}

export function getById(id: string): ExpressData | null {
  return getList().find(r => r.id === id) || null
}

export function getStats() {
  const list = getList()
  return {
    pending: list.filter(r => r.status === 'pending').length,
    picked: list.filter(r => r.status === 'picked').length,
    total: list.length
  }
}

function saveList(list: ExpressData[]) {
  localStorage.setItem(KEY, JSON.stringify(list))
}