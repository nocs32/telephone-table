import { makeAutoObservable } from 'mobx';
import type { PreferencesService } from '../../../services';
import { UiWidgetsAreaStore } from './area';
import { UiWidgetsFrameStore } from './frame';

export interface UiWidgetsDeps {
  preferences: PreferencesService;
  isWideLayout: boolean;
}

// Felt Table's floating widgets, here just the chat (spec §7): it floats over the game, bottom left,
// opened from the dock's chat button.
export class UiWidgetsStore {
  readonly area = new UiWidgetsAreaStore();
  readonly chat: UiWidgetsFrameStore;

  constructor({ preferences, isWideLayout }: UiWidgetsDeps) {
    this.chat = new UiWidgetsFrameStore(
      { key: 'chat', corner: 'bottomLeft', width: 340, height: 420, minWidth: 260, minHeight: 220, isOpenByDefault: isWideLayout, aspect: () => null },
      this.area,
      preferences,
    );

    makeAutoObservable(this, { area: false, chat: false }, { autoBind: true });
  }

  get showsChat(): boolean {
    return this.area.isMeasured && this.chat.isOpen;
  }
}
