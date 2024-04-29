import { handleScreen } from './core/recordscreen';
import { SdkBase, RecordScreenOption, BasePlugin } from '@front-monitor/types';
import { EVENT_TYPES } from '@front-monitor/common';
import { validateOption, generateUUID, _support } from '@front-monitor/utils';

export default class RecordScreen extends BasePlugin {
  type: string;
  recordScreenTime = 10; // 默认录屏时长
  recordScreenTypeList: string[] = [
    EVENT_TYPES.ERROR,
    EVENT_TYPES.UNHANDLEDREJECTION,
    EVENT_TYPES.RESOURCE,
    EVENT_TYPES.FETCH,
    EVENT_TYPES.XHR,
  ]; // 录屏事件集合
  constructor(params = {} as RecordScreenOption) {
    super(EVENT_TYPES.RECORD_SCREEN);
    this.type = EVENT_TYPES.RECORD_SCREEN;
    this.bindOptions(params);
  }
  bindOptions(params: RecordScreenOption) {
    const { recordScreenTypeList, recordScreenTime } = params;
    validateOption(recordScreenTime, 'recordScreenTime', 'number') &&
      (this.recordScreenTime = recordScreenTime);
    validateOption(recordScreenTypeList, 'recordScreenTypeList', 'array') &&
      (this.recordScreenTypeList = recordScreenTypeList);
  }
  core({ transportData, options }: SdkBase) {
    // 给公共配置上添加开启录屏的标识 和 录屏列表
    options.silentRecordScreen = true;
    options.recordScreenTypeList = this.recordScreenTypeList;
    // 添加初始的recordScreenId
    _support.recordScreenId = generateUUID();
    handleScreen(transportData, this.recordScreenTime);
  }
  transform() {}
}
