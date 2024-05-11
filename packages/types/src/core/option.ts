import { ReportData, BreadcrumbData } from './base';

export interface InitOptions {
  dsn: string; // 上报的地址
  appKey: string; // 项目id
  userId?: string; // 用户id
  disabled?: boolean; // 是否禁用SDK 默认false
  silentXhr?: boolean; // 是否监控 xhr 请求 默认true
  silentFetch?: boolean; // 是否监控 fetch 请求 默认true
  silentClick?: boolean; // 是否监控 click 事件 默认true
  silentError?: boolean; // 是否监听 error 事件 默认true
  silentUnhandledrejection?: boolean; // 是否监控 unhandledrejection 默认true
  silentHashchange?: boolean; // 是否监听路由 hash 模式变化 默认true
  silentHistory?: boolean; // 是否监听路由 history模式变化 默认true
  silentPerformance?: boolean; // 是否获取页面性能指标 默认true
  silentRecordScreen?: boolean; // 是否开启录屏 默认false
  recordScreenTime?: number; // 单次录屏时长
  recordScreenTypeList?: string[]; // 上报录屏的错误列表
  silentWhiteScreen?: boolean; // 是否开启白屏检测 默认false
  skeletonProject?: boolean; // 白屏检测的项目是否有骨架屏 默认false
  whiteBoxElements?: string[]; // 白屏检测的容器列表 默认 ['html', 'body', '#app', '#root']
  filterXhrUrlRegExp?: RegExp; // 过滤的接口请求正则 过滤掉的接口不上报错误
  useImgUpload?: boolean; // 是否使用图片打点上报 默认false
  throttleDelayTime?: number; // click点击事件的节流时长 默认0
  overTime?: number; // 接口超时时长 默认0
  maxBreadcrumbs?: number; // 用户行为存放的最大长度 默认20
  beforePushBreadcrumb?(data: BreadcrumbData): BreadcrumbData; // 添加到行为列表前的 hook
  beforeDataReport?(data: ReportData): Promise<ReportData | boolean>; // 数据上报前的 hook
  getUserId?: () => string | number; // 用户定义的 获取userId
  handleHttpStatus?: (data: any) => boolean; // 处理接口返回的 response 返回true表示请求成功，返回false表示失败，进行错误上报
  reportOnlyOnce?: boolean; // 是否去除重复的代码错误，重复的错误只上报一次
}

// 录屏插件参数
export interface RecordScreenOption {
  recordScreenTypeList: string[];
  recordScreenTime: number; // 录屏时长 默认10秒
}
