import { ExpressData, ExpressStatus } from '../model/ExpressData';
import { expressStorage } from '../utils/ExpressStorage';
import router from '@ohos.router';
import promptAction from '@ohos.promptAction';

@Entry
@Component
struct ExpressDetail {
  @State record: ExpressData | null = null;
  @State createTime: string = '';
  @State pickedTime: string = '';
  private id: string = '';

  aboutToAppear() {
    const params = router.getParams() as Record<string, string>;
    this.id = params?.id || '';
  }

  onPageShow() {
    this.loadRecord();
  }

  async loadRecord() {
    const record = await expressStorage.getById(this.id);
    if (!record) {
      router.back();
      return;
    }
    this.record = record;
    this.createTime = this.formatTime(record.createdAt);
    this.pickedTime = record.pickedAt ? this.formatTime(record.pickedAt) : '';
  }

  formatTime(ts: number): string {
    const d = new Date(ts);
    const pad = (n: number) => n < 10 ? '0' + n : '' + n;
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${pad(d.getMinutes())}`;
  }

  async togglePick() {
    if (!this.record) return;
    if (this.record.status === ExpressStatus.PENDING) {
      await expressStorage.updateRecord(this.id, { status: ExpressStatus.PICKED, pickedAt: Date.now() });
    } else {
      await expressStorage.updateRecord(this.id, { status: ExpressStatus.PENDING, pickedAt: null });
    }
    this.loadRecord();
  }

  async onDelete() {
    promptAction.showDialog({
      title: '确认删除',
      message: '删除后不可恢复',
      buttons: [
        { text: '取消', color: '#999' },
        { text: '删除', color: '#FF4D4F' }
      ]
    }).then((result) => {
      if (result.index === 1) {
        expressStorage.deleteRecord(this.id);
        router.back();
      }
    });
  }

  build() {
    if (this.record) {
      Scroll() {
        Column() {
          Text(this.record.status === ExpressStatus.PENDING ? '📦 待取件' : '✅ 已取件')
            .fontSize(18)
            .fontWeight(FontWeight.Medium)
            .fontColor(this.record.status === ExpressStatus.PENDING ? '#4A90D9' : '#52C41A')
            .backgroundColor(this.record.status === ExpressStatus.PENDING ? '#e8f2fe' : '#f0fff0')
            .borderRadius(8)
            .padding(12)
            .width('100%')
            .textAlign(TextAlign.Center)
            .margin({ bottom: 16 })

          this.DetailRow('驿站', this.record.station || '未填写')
          this.DetailRow('取件码', this.record.code, true)
          this.DetailRow('快递公司', this.record.courier || '未填写')
          this.DetailRow('手机尾号', this.record.phone || '未填写')
          this.DetailRow('添加时间', this.createTime)
          if (this.record.pickedAt) {
            this.DetailRow('取件时间', this.pickedTime)
          }

          Button(this.record.status === ExpressStatus.PENDING ? '标记已取件' : '取消取件标记')
            .type(ButtonType.Capsule)
            .width('100%')
            .margin({ top: 24 })
            .backgroundColor(this.record.status === ExpressStatus.PENDING ? '#52C41A' : '#fff')
            .fontColor(this.record.status === ExpressStatus.PENDING ? '#fff' : '#4A90D9')
            .border(this.record.status === ExpressStatus.PENDING ? {} : { width: 1, color: '#4A90D9' })
            .onClick(() => this.togglePick())

          if (this.record.latitude && this.record.longitude) {
            Button('📍 导航到驿站')
              .type(ButtonType.Capsule)
              .width('100%')
              .margin({ top: 12 })
              .backgroundColor('#fff')
              .fontColor('#4A90D9')
              .border({ width: 1, color: '#4A90D9' })
          }

          Button('删除记录')
            .type(ButtonType.Capsule)
            .width('100%')
            .margin({ top: 12 })
            .backgroundColor('#fff')
            .fontColor('#FF4D4F')
            .border({ width: 1, color: '#FF4D4F' })
            .onClick(() => this.onDelete())
        }
        .width('100%')
        .padding(16)
      }
      .width('100%')
      .height('100%')
      .backgroundColor('#f5f6fa')
      .scrollBar(BarState.Off)
    } else {
      Column() {
        Text('加载中...')
          .fontSize(16)
          .fontColor('#999')
      }
      .width('100%')
      .height('100%')
      .justifyContent(FlexAlign.Center)
    }
  }

  @Builder DetailRow(label: string, value: string, isCode: boolean = false) {
    Row() {
      Text(label).fontSize(14).fontColor('#999').width(100)
      Text(value)
        .fontSize(isCode ? 18 : 16)
        .fontColor(isCode ? '#4A90D9' : '#333')
        .fontWeight(isCode ? FontWeight.Bold : FontWeight.Medium)
        .layoutWeight(1)
        .textAlign(isCode ? TextAlign.Right : TextAlign.Start)
    }
    .width('100%')
    .padding({ top: 14, bottom: 14 })
    .border({ width: { bottom: 1 }, color: { bottom: '#f5f5f5' } })
  }
}