import ErrorStackParser from 'error-stack-parser';
import { transportData } from './reportData';
import { breadcrumb } from './breadcrumb';
import { EVENT_TYPES, STATUS_CODE } from '@front-monitor/common';
import { isError, getTimestamp, unknownToString } from '@front-monitor/utils';

// 自定义上报事件
export function log({
  message = 'customMsg',
  error = '',
  data,
  type = EVENT_TYPES.CUSTOM,
}: any): void {
  try {
    let errorInfo = {};
    if (isError(error)) {
      const result = ErrorStackParser.parse(!error.target ? error : error.error || error.reason)[0];
      errorInfo = { ...result, line: result.lineNumber, column: result.columnNumber };
    }
    breadcrumb.push({
      type,
      status: STATUS_CODE.ERROR,
      category: breadcrumb.getCategory(EVENT_TYPES.CUSTOM),
      data: unknownToString(message),
      time: getTimestamp(),
    });
    transportData.send({
      type,
      status: STATUS_CODE.ERROR,
      message: unknownToString(message),
      time: getTimestamp(),
      data,
      ...errorInfo,
    });
  } catch (err) {
    // console.log('上报自定义事件时报错：', err);
  }
}
