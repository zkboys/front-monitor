import ErrorStackParser from 'error-stack-parser';
import {
  openWhiteScreen,
  transportData,
  breadcrumb,
  resourceTransform,
  httpTransform,
  options,
} from './index';
import { EVENT_TYPES, STATUS_CODE } from '@front-monitor/common';
import {
  getErrorUid,
  hashMapExist,
  getTimestamp,
  parseUrlToObj,
  unknownToString,
} from '@front-monitor/utils';
import { ErrorTarget, RouteHistory, HttpData } from '@front-monitor/types';

/**
 * 数据上报，基于reportOnlyOnce判断是否重复上报
 * @param errorData
 * @param hashStr
 */
function report(errorData: any, hashStr: string) {
  const hash: string = getErrorUid(hashStr);

  // 开启reportOnlyOnce，并且已经上报过了，直接返回
  if (options.reportOnlyOnce && hashMapExist(hash)) return;

  return transportData.send(errorData);
}

const HandleEvents = {
  // 处理xhr、fetch回调
  handleHttp(data: HttpData, type: EVENT_TYPES): void {
    const result = httpTransform(data);
    // 添加用户行为，去掉自身上报的接口行为
    if (!data.url.includes(options.dsn)) {
      breadcrumb.push({
        type,
        category: breadcrumb.getCategory(type),
        data: result,
        status: result.status,
        time: data.time,
      });
    }

    if (result.status === 'error') {
      // 上报接口错误
      const errorData = { ...result, type, status: STATUS_CODE.ERROR };
      const hashStr = `${data.method}-${data.url}-${JSON.stringify(data.requestData)}`;
      return report(errorData, hashStr);
    }
  },
  handleError(ev: ErrorTarget): void {
    const target = ev.target;
    if (!target || (ev.target && !ev.target.localName)) {
      // vue和react捕获的报错使用ev解析，异步错误使用ev.error解析
      const stackFrame = ErrorStackParser.parse(!target ? ev : ev.error)[0];
      const { fileName, columnNumber, lineNumber } = stackFrame;
      const errorData = {
        type: EVENT_TYPES.ERROR,
        status: STATUS_CODE.ERROR,
        time: getTimestamp(),
        message: ev.message,
        fileName,
        line: lineNumber,
        column: columnNumber,
      };
      breadcrumb.push({
        type: EVENT_TYPES.ERROR,
        category: breadcrumb.getCategory(EVENT_TYPES.ERROR),
        data: errorData,
        time: getTimestamp(),
        status: STATUS_CODE.ERROR,
      });
      const hashStr = `${EVENT_TYPES.ERROR}-${ev.message}-${fileName}-${columnNumber}`;

      return report(errorData, hashStr);
    }

    // 资源加载报错
    if (target?.localName) {
      // 提取资源加载的信息
      const data = resourceTransform(target);
      breadcrumb.push({
        type: EVENT_TYPES.RESOURCE,
        category: breadcrumb.getCategory(EVENT_TYPES.RESOURCE),
        status: STATUS_CODE.ERROR,
        time: getTimestamp(),
        data,
      });
      const errorData = {
        ...data,
        type: EVENT_TYPES.RESOURCE,
        status: STATUS_CODE.ERROR,
      };
      const hashStr = `${target?.localName}`;

      return report(errorData, hashStr);
    }
  },
  handleHistory(data: RouteHistory): void {
    const { from, to } = data;
    // 定义parsedFrom变量，值为relative
    const { relative: parsedFrom } = parseUrlToObj(from);
    const { relative: parsedTo } = parseUrlToObj(to);
    breadcrumb.push({
      type: EVENT_TYPES.HISTORY,
      category: breadcrumb.getCategory(EVENT_TYPES.HISTORY),
      data: {
        from: parsedFrom ? parsedFrom : '/',
        to: parsedTo ? parsedTo : '/',
      },
      time: getTimestamp(),
      status: STATUS_CODE.OK,
    });
  },
  handleHashchange(data: HashChangeEvent): void {
    const { oldURL, newURL } = data;
    const { relative: from } = parseUrlToObj(oldURL);
    const { relative: to } = parseUrlToObj(newURL);
    breadcrumb.push({
      type: EVENT_TYPES.HASHCHANGE,
      category: breadcrumb.getCategory(EVENT_TYPES.HASHCHANGE),
      data: {
        from,
        to,
      },
      time: getTimestamp(),
      status: STATUS_CODE.OK,
    });
  },
  handleUnHandleRejection(ev: PromiseRejectionEvent): void {
    const stackFrame = ErrorStackParser.parse(ev.reason)[0];
    const { fileName, columnNumber, lineNumber } = stackFrame;
    const message = unknownToString(ev.reason.message || ev.reason.stack);
    const errorData = {
      type: EVENT_TYPES.UNHANDLEDREJECTION,
      status: STATUS_CODE.ERROR,
      time: getTimestamp(),
      message,
      fileName,
      line: lineNumber,
      column: columnNumber,
    };

    breadcrumb.push({
      type: EVENT_TYPES.UNHANDLEDREJECTION,
      category: breadcrumb.getCategory(EVENT_TYPES.UNHANDLEDREJECTION),
      time: getTimestamp(),
      status: STATUS_CODE.ERROR,
      data: errorData,
    });

    const hashStr = `${EVENT_TYPES.UNHANDLEDREJECTION}-${message}-${fileName}-${columnNumber}`;

    return report(errorData, hashStr);
  },
  handleWhiteScreen(): void {
    openWhiteScreen((res: any) => {
      // 上报白屏检测信息
      transportData.send({
        type: EVENT_TYPES.WHITE_SCREEN,
        time: getTimestamp(),
        ...res,
      });
    }, options);
  },
};
export { HandleEvents };
