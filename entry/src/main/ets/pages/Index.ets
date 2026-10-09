import { ExpressData, ExpressStatus } from '../model/ExpressData';
import { expressStorage } from '../utils/ExpressStorage';
import router from '@ohos.router';

@Entry
@Component
struct Index {
  @State pendingList: ExpressData[] = [];
  @State pickedList: ExpressData[] = [];
  @State pendingCount: number = 0;
  @State pickedCount: number = 0;
  @State showPicked: boolean = false;

  aboutToAppear() {
    this.loadData();
  }

  onPageShow() {
    this.loadData();
  }

  async loadData() {
    this.pendingList = await expressStorage.getPendingList();
    this.pickedList = await expressStorage.getPickedList();
    const stats = await expressStorage.getStats();
    this.pendingCount = stats.pending;
    this.pickedCount = stats.picked;
  }

  async quickPick(item: ExpressData) {
    await expressStorage.updateRecord(item.id, { status: ExpressStatus.PICKED, pickedAt: Date.now() });
    this.loadData();
  }

  build() {
    Stack({ alignContent: Alignment.BottomEnd }) {
      Column() {
        this.StatsBar()

        Scroll() {
          Column() {
            if (this.pendingCount > 0) {
              Text('📦 待取件')
                .fontSize(16)
                .fontWeight(FontWeight.Medium)
                .margin({ bottom: 8, left: 4 })
                .width('100%')
            }

            ForEach(this.pendingList, (item: ExpressData) => {
              this.ExpressCard(item, false)
            }, (item: ExpressData) => item.id)

            if (this.pendingCount === 0 && this.pickedCount === 0) {
              Column() {
                Text('📦').fontSize(40).margin({ bottom: 12 })
                Text('还没有快递记录').fontSize(16).fontColor('#999')
                Text('点击右下角 + 添加快递').fontSize(13).fontColor('#ccc').margin({ top: 4 })
              }
              .width('100%')
              .padding({ top: 80, bottom: 80 })
              .alignItems(HorizontalAlign.Center)
            }

            if (this.pickedCount > 0) {
              Text(`✅ 已取件 (${this.pickedCount}) ${this.showPicked ? '▲' : '▼'}`)
                .fontSize(16)
                .fontWeight(FontWeight.Medium)
                .margin({ top: 16, bottom: 8, left: 4 })
                .width('100%')
                .onClick(() => this.showPicked = !this.showPicked)

              if (this.showPicked) {
                ForEach(this.pickedList, (item: ExpressData) => {
                  this.ExpressCard(item, true)
                }, (item: ExpressData) => item.id)
              }
            }
          }
          .width('100%')
        }
        .layoutWeight(1)
        .scrollBar(BarState.Off)
      }
      .width('100%')
      .height('100%')
      .backgroundColor('#f5f6fa')
      .padding(12)

      Text('+')
        .fontSize(28)
        .fontColor('#fff')
        .fontWeight(FontWeight.Normal)
        .width(50)
        .height(50)
        .borderRadius(25)
        .backgroundColor('#4A90D9')
        .textAlign(TextAlign.Center)
        .margin({ right: 20, bottom: 30 })
        .onClick(() => router.pushUrl({ url: 'pages/AddExpress' }))
    }
    .width('100%')
    .height('100%')
  }

  @Builder StatsBar() {
    Row() {
      Column() {
        Text(this.pendingCount.toString())
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor('#4A90D9')
        Text('待取件')
          .fontSize(12)
          .fontColor('#999')
          .margin({ top: 4 })
      }
      .layoutWeight(1)

      Divider().vertical().height(30).color('#eee')

      Column() {
        Text(this.pickedCount.toString())
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor('#52C41A')
        Text('已取件')
          .fontSize(12)
          .fontColor('#999')
          .margin({ top: 4 })
      }
      .layoutWeight(1)
    }
    .width('100%')
    .backgroundColor('#fff')
    .borderRadius(12)
    .padding(16)
    .margin({ bottom: 16 })
  }

  @Builder ExpressCard(item: ExpressData, isPicked: boolean) {
    Row() {
      Column() {
        Row() {
          Text(item.station || '未知驿站')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .fontColor('#333')
          if (item.courier) {
            Text(item.courier)
              .fontSize(11)
              .fontColor('#fff')
              .backgroundColor('#4A90D9')
              .borderRadius(10)
              .padding({ left: 6, right: 6, top: 2, bottom: 2 })
              .margin({ left: 8 })
          }
        }
        .width('100%')

        Row() {
          Text(`取件码：${item.code}`)
            .fontSize(14)
            .fontColor('#555')
          if (item.phone) {
            Text(`尾号 ${item.phone}`)
              .fontSize(12)
              .fontColor('#999')
              .margin({ left: 12 })
          }
        }
        .width('100%')
        .margin({ top: 6 })
      }
      .layoutWeight(1)
      .alignItems(HorizontalAlign.Start)

      if (!isPicked) {
        Text('✅ 已取')
          .fontSize(13)
          .fontColor('#52C41A')
          .border({ width: 1, color: '#52C41A' })
          .borderRadius(15)
          .padding({ left: 10, right: 10, top: 4, bottom: 4 })
          .onClick(() => this.quickPick(item))
      }
    }
    .width('100%')
    .backgroundColor('#fff')
    .borderRadius(12)
    .padding(14)
    .margin({ bottom: 10 })
    .border({ width: { left: 4 }, color: { left: isPicked ? '#52C41A' : '#4A90D9' } })
    .opacity(isPicked ? 0.65 : 1)
    .onClick(() => {
      router.pushUrl({ url: `pages/ExpressDetail?id=${item.id}` });
    })
  }
}