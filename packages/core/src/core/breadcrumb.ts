import { EVENT_TYPES, BREADCRUMB_TYPES } from '@front-monitor/common';
import { validateOption, getTimestamp, _support } from '@front-monitor/utils';
import { BreadcrumbData, InitOptions } from '@front-monitor/types';

export class Breadcrumb {
  maxBreadcrumbs = 20; // 用户行为存放的最大长度
  beforePushBreadcrumb: unknown = null;
  stack: BreadcrumbData[];

  constructor() {
    this.stack = [];
  }

  /**
   * 添加用户行为栈
   */
  push(data: BreadcrumbData): void {
    if (typeof this.beforePushBreadcrumb === 'function') {
      // 执行用户自定义的hook
      const result = this.beforePushBreadcrumb(data) as BreadcrumbData;
      if (!result) return;
      this.immediatePush(result);
      return;
    }
    this.immediatePush(data);
  }

  immediatePush(data: BreadcrumbData): void {
    data.time || (data.time = getTimestamp());
    if (this.stack.length >= this.maxBreadcrumbs) {
      this.shift();
    }
    this.stack.push(data);
    this.stack.sort((a, b) => a.time - b.time);
  }

  shift(): boolean {
    return this.stack.shift() !== undefined;
  }

  clear(): void {
    this.stack = [];
  }

  getStack(): BreadcrumbData[] {
    return this.stack;
  }

  getCategory(type: EVENT_TYPES): BREADCRUMB_TYPES {
    switch (type) {
      // 接口请求
      case EVENT_TYPES.XHR:
      case EVENT_TYPES.FETCH:
        return BREADCRUMB_TYPES.HTTP;

      // 用户点击
      case EVENT_TYPES.CLICK:
        return BREADCRUMB_TYPES.CLICK;

      // 路由变化
      case EVENT_TYPES.HISTORY:
      case EVENT_TYPES.HASHCHANGE:
        return BREADCRUMB_TYPES.ROUTE;

      // 加载资源
      case EVENT_TYPES.RESOURCE:
        return BREADCRUMB_TYPES.RESOURCE;

      // Js代码报错
      case EVENT_TYPES.UNHANDLEDREJECTION:
      case EVENT_TYPES.ERROR:
        return BREADCRUMB_TYPES.CODE_ERROR;

      // 用户自定义
      default:
        return BREADCRUMB_TYPES.CUSTOM;
    }
  }

  bindOptions(options: InitOptions): void {
    // maxBreadcrumbs 用户行为存放的最大容量
    // beforePushBreadcrumb 添加用户行为前的处理函数
    const { maxBreadcrumbs, beforePushBreadcrumb } = options;
    validateOption(maxBreadcrumbs, 'maxBreadcrumbs', 'number') &&
      (this.maxBreadcrumbs = maxBreadcrumbs || 20);
    validateOption(beforePushBreadcrumb, 'beforePushBreadcrumb', 'function') &&
      (this.beforePushBreadcrumb = beforePushBreadcrumb);
  }
}

const breadcrumb = _support.breadcrumb || (_support.breadcrumb = new Breadcrumb());
export { breadcrumb };
