import {
  subscribeEvent,
  notify,
  transportData,
  breadcrumb,
  options,
  handleOptions,
  log,
  setupReplace,
  HandleEvents,
} from './core';
import { _global, getFlag, setFlag, nativeTryCatch } from '@front-monitor/utils';
import { SDK_VERSION, SDK_NAME, EVENT_TYPES } from '@front-monitor/common';
import { InitOptions, VueInstance, ViewModel } from '@front-monitor/types';

function init(options: InitOptions) {
  if (!options.dsn || !options.appKey) {
    return console.error(`front-monitor 缺少必须配置项：${!options.dsn ? 'dsn' : 'appKey'} `);
  }
  if (!('fetch' in _global) || options.disabled) return;
  // 初始化配置
  handleOptions(options);
  setupReplace();
}

function install(Vue: VueInstance, options: InitOptions) {
  if (getFlag(EVENT_TYPES.VUE)) return;
  setFlag(EVENT_TYPES.VUE, true);
  const handler = Vue.config.errorHandler;
  // vue项目在Vue.config.errorHandler中上报错误
  Vue.config.errorHandler = function (err: Error, vm: ViewModel, info: string): void {
    console.log(err);
    HandleEvents.handleError(err);
    if (handler) handler.apply(null, [err, vm, info]);
  };
  init(options);
}

// react项目在ErrorBoundary中上报错误
function errorBoundary(err: Error): void {
  if (getFlag(EVENT_TYPES.REACT)) return;
  setFlag(EVENT_TYPES.REACT, true);
  HandleEvents.handleError(err);
}

function use(plugin: any, option?: any) {
  const instance = new plugin(option);
  if (
    !subscribeEvent({
      callback: data => {
        instance.transform(data);
      },
      type: instance.type,
    })
  )
    return;

  nativeTryCatch(() => {
    instance.core({ transportData, breadcrumb, options, notify });
  });
}

export default {
  SDK_VERSION,
  SDK_NAME,
  init,
  install,
  errorBoundary,
  use,
  log,
};
