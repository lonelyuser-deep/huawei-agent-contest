const storage = require('../../utils/storage.js')
const { parseInput } = require('../../utils/parse.js')

Page({
  data: {
    rawInput: '',
    form: {
      station: '',
      code: '',
      courier: '',
      phone: ''
    },
    couriers: ['请选择', '顺丰', '圆通', '中通', '申通', '韵达', '百世', '邮政EMS', '京东', '德邦', '极兔'],
    courierIndex: 0
  },

  onRawInput(e) {
    this.setData({ rawInput: e.detail.value })
  },

  parseText() {
    const text = this.data.rawInput
    if (!text.trim()) {
      wx.showToast({ title: '请先输入内容', icon: 'none' })
      return
    }
    const result = parseInput(text)
    if (!result) {
      wx.showToast({ title: '未能识别', icon: 'none' })
      return
    }
    const form = {
      station: result.station || '',
      code: result.code || '',
      courier: result.courier || '',
      phone: result.phone || ''
    }
    let courierIndex = 0
    if (form.courier) {
      const idx = this.data.couriers.indexOf(form.courier)
      if (idx > -1) courierIndex = idx
    }
    this.setData({ form, courierIndex })
    wx.showToast({ title: '识别完成', icon: 'success' })
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ ['form.' + field]: e.detail.value })
  },

  onCourierChange(e) {
    const idx = e.detail.value
    this.setData({
      courierIndex: idx,
      'form.courier': idx === 0 ? '' : this.data.couriers[idx]
    })
  },

  onSave() {
    const { station, code, courier, phone } = this.data.form
    if (!code) {
      wx.showToast({ title: '请填写取件码', icon: 'none' })
      return
    }
    storage.addRecord({ station, code, courier, phone })
    wx.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => wx.navigateBack(), 1000)
  }
})