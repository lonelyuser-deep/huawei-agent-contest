const storage = require('../../utils/storage.js')

Page({
  data: {
    record: null,
    createTime: '',
    pickedTime: ''
  },

  onLoad(options) {
    this.recordId = options.id
  },

  onShow() {
    const record = storage.getById(this.recordId)
    if (!record) {
      wx.showToast({ title: '记录不存在', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1000)
      return
    }
    this.setData({
      record,
      createTime: this.formatTime(record.createdAt),
      pickedTime: record.pickedAt ? this.formatTime(record.pickedAt) : ''
    })
  },

  formatTime(ts) {
    const d = new Date(ts)
    const pad = (n) => String(n).padStart(2, '0')
    return d.getMonth() + 1 + '/' + d.getDate() + ' ' + d.getHours() + ':' + pad(d.getMinutes())
  },

  togglePick() {
    const record = this.data.record
    if (record.status === 'pending') {
      storage.updateRecord(this.recordId, { status: 'picked', pickedAt: Date.now() })
      wx.showToast({ title: '取件成功！', icon: 'success' })
    } else {
      storage.updateRecord(this.recordId, { status: 'pending', pickedAt: null })
      wx.showToast({ title: '已取消', icon: 'none' })
    }
    this.onShow()
  },

  onDelete() {
    wx.showModal({
      title: '确认删除',
      content: '删除后不可恢复',
      success: (res) => {
        if (res.confirm) {
          storage.deleteRecord(this.recordId)
          wx.navigateBack()
        }
      }
    })
  }
})