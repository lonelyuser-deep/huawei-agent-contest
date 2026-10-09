const KEY = 'express_list'

function getList() {
  return wx.getStorageSync(KEY) || []
}

function saveList(list) {
  wx.setStorageSync(KEY, list)
}

function addRecord(record) {
  const list = getList()
  record.id = Date.now().toString() + Math.random().toString(36).substr(2, 5)
  record.status = 'pending'
  record.createdAt = Date.now()
  record.pickedAt = null
  list.unshift(record)
  saveList(list)
  return record
}

function updateRecord(id, updates) {
  const list = getList()
  const item = list.find(r => r.id === id)
  if (item) {
    Object.assign(item, updates)
    saveList(list)
  }
  return item
}

function deleteRecord(id) {
  const list = getList().filter(r => r.id !== id)
  saveList(list)
}

function getById(id) {
  return getList().find(r => r.id === id)
}

function getStats() {
  const list = getList()
  return {
    pending: list.filter(r => r.status === 'pending').length,
    picked: list.filter(r => r.status === 'picked').length,
    total: list.length
  }
}

module.exports = {
  getList,
  saveList,
  addRecord,
  updateRecord,
  deleteRecord,
  getById,
  getStats
}