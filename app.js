App({
  onLaunch() {
    const list = wx.getStorageSync('express_list')
    if (!list) {
      wx.setStorageSync('express_list', [])
    }
  },
  globalData: {
    version: '1.0.0-demo'
  }
})