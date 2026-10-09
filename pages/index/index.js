const storage = require('../../utils/storage.js')

Page({
  data: {
    pendingList: [],
    pickedList: [],
    stats: { pending: 0, picked: 0, total: 0 },
    showPicked: false
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    const list = storage.getList()
    const pendingList = list.filter(r => r.status === 'pending')
    const pickedList = list.filter(r => r.status === 'picked')
    this.setData({
      pendingList,
      pickedList,
      stats: storage.getStats()
    })
  },

  goAdd() {
    wx.navigateTo({ url: '/pages/add/add' })
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/detail/detail?id=' + id })
  },

  quickPick(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认取件',
      content: '标记这个快递为已取件？',
      success: (res) => {
        if (res.confirm) {
          storage.updateRecord(id, { status: 'picked', pickedAt: Date.now() })
          this.loadData()
          wx.showToast({ title: '取件成功！', icon: 'success' })
        }
      }
    })
  },

  togglePicked() {
    this.setData({ showPicked: !this.data.showPicked })
  }
})