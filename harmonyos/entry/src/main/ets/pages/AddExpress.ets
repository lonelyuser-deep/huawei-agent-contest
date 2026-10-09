import { createExpress } from '../model/ExpressData';
import { expressStorage } from '../utils/ExpressStorage';
import { parseClipboard } from '../utils/NotificationParser';
import router from '@ohos.router';
import pasteboard from '@ohos.pasteboard';

@Entry
@Component
struct AddExpress {
  @State rawInput: string = '';
  @State station: string = '';
  @State code: string = '';
  @State courier: string = '';
  @State phone: string = '';
  @State clipboardHint: string = '';
  @State couriers: string[] = ['请选择', '顺丰', '圆通', '中通', '申通', '韵达', '百世', '邮政EMS', '京东', '德邦', '极兔'];
  @State selectedCourierIndex: number = 0;

  aboutToAppear() {
    this.checkClipboard();
  }

  async checkClipboard() {
    try {
      const pasteData = await pasteboard.getSystemPasteboard().getData();
      if (pasteData && pasteData.getPrimaryText()) {
        const text = pasteData.getPrimaryText();
        const result = parseClipboard(text);
        if (result && result.code) {
          this.clipboardHint = '检测到粘贴板有快递信息，点击下方"智能识别"自动填入';
          this.rawInput = text;
        }
      }
    } catch (e) {
      console.info('Clipboard check skipped');
    }
  }

  parseText() {
    if (!this.rawInput.trim()) {
      return;
    }
    const result = parseClipboard(this.rawInput);
    if (result) {
      this.station = result.station;
      this.code = result.code;
      this.courier = result.courier;
      this.phone = result.phone;
      const idx = this.couriers.indexOf(result.courier);
      this.selectedCourierIndex = idx > -1 ? idx : 0;
    }
  }

  async onSave() {
    if (!this.code) {
      return;
    }
    const record = createExpress(this.station, this.code, this.courier, this.phone);
    await expressStorage.addRecord(record);
    router.back();
  }

  build() {
    Scroll() {
      Column() {
        Text('🤖 智能录入')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 8 })

        if (this.clipboardHint) {
          Text(this.clipboardHint)
            .fontSize(12)
            .fontColor('#4A90D9')
            .backgroundColor('#e8f2fe')
            .borderRadius(8)
            .padding(10)
            .width('100%')
            .margin({ bottom: 8 })
        }

        TextArea({ placeholder: '粘贴快递通知，或输入如：菜鸟驿站取件码1-3-201圆通尾号1234' })
          .width('100%')
          .height(80)
          .fontSize(14)
          .backgroundColor('#f5f6fa')
          .borderRadius(8)
          .padding(10)
          .onChange((value: string) => this.rawInput = value)

        Button('智能识别')
          .type(ButtonType.Capsule)
          .width('100%')
          .margin({ top: 8 })
          .backgroundColor('#4A90D9')
          .onClick(() => this.parseText())

        Text('📝 手动填写')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .margin({ top: 20, bottom: 8 })

        this.FormItem('驿站名称', this.station, '如：菜鸟驿站', (v: string) => this.station = v)
        this.FormItem('取件码', this.code, '如：1-3-201', (v: string) => this.code = v)

        Row() {
          Text('快递公司').fontSize(15).fontColor('#333').width(90)
          Select(this.couriers)
            .selected(this.selectedCourierIndex)
            .value(this.couriers[this.selectedCourierIndex])
            .onSelect((index: number) => {
              this.selectedCourierIndex = index;
              this.courier = index === 0 ? '' : this.couriers[index];
            })
            .layoutWeight(1)
        }
        .width('100%')
        .padding({ top: 12, bottom: 12 })
        .border({ width: { bottom: 1 }, color: { bottom: '#f0f0f0' } })

        this.FormItem('手机尾号', this.phone, '后4位（选填）', (v: string) => this.phone = v)

        Button('保存')
          .type(ButtonType.Capsule)
          .width('100%')
          .margin({ top: 24 })
          .backgroundColor('#4A90D9')
          .onClick(() => this.onSave())
      }
      .width('100%')
      .padding(16)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#f5f6fa')
    .scrollBar(BarState.Off)
  }

  @Builder FormItem(label: string, value: string, placeholder: string, onChange: (v: string) => void) {
    Row() {
      Text(label).fontSize(15).fontColor('#333').width(90)
      TextInput({ text: value, placeholder: placeholder })
        .fontSize(14)
        .layoutWeight(1)
        .onChange(onChange)
    }
    .width('100%')
    .padding({ top: 12, bottom: 12 })
    .border({ width: { bottom: 1 }, color: { bottom: '#f0f0f0' } })
  }
}