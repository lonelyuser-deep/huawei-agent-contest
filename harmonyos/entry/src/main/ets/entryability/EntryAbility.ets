import UIAbility from '@ohos.app.ability.UIAbility';
import window from '@ohos.window';

export default class EntryAbility extends UIAbility {
  onWindowStageCreate(windowStage: window.WindowStage) {
    windowStage.loadContent('pages/Index', (err) => {
      if (err.code) {
        console.error('Failed to load content. Cause: ' + JSON.stringify(err));
        return;
      }
      console.info('Succeeded in loading content.');
    });
  }

  onCreate(want, launchParam) {
    console.info('ExpressHelper EntryAbility onCreate');
  }

  onDestroy() {
    console.info('ExpressHelper EntryAbility onDestroy');
  }
}