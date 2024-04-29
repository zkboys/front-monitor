import { getFlag, nativeTryCatch, setFlag } from '@front-monitor/utils';
import { ReplaceHandler, ReplaceCallback } from '@front-monitor/types';
import { EVENT_TYPES } from '@front-monitor/common';

const handlers: { [key in EVENT_TYPES]?: ReplaceCallback[] } = {};

// subscribeEvent 设置标识，并将处理的方法放置到handlers中，{ xhr: [ function ] }
export function subscribeEvent(handler: ReplaceHandler): boolean {
  if (!handler || getFlag(handler.type)) return false;
  setFlag(handler.type, true);
  handlers[handler.type] = handlers[handler.type] || [];
  handlers[handler.type]?.push(handler.callback);
  return true;
}

export function notify(type: EVENT_TYPES, data?: any): void {
  if (!type || !handlers[type]) return;
  // 获取对应事件的回调函数并执行，回调函数为addReplaceHandler事件中定义的事件
  handlers[type]?.forEach(callback => {
    nativeTryCatch(
      () => {
        callback(data);
      },
      () => {
        // console.error(
        //   `front-monitor 重写事件notify的回调函数发生错误\nType:${type}\nName: ${getFunctionName(
        //     callback
        //   )}\nError: ${e}`
        // );
      }
    );
  });
}
