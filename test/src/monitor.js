import frontMonitor from '@front-monitor/core';
import performance from '@front-monitor/performance';
import recordScreen from '@front-monitor/recordscreen';

frontMonitor.init({
  // disabled: true,
  dsn: 'http://localhost:8083/reportData', // 上报的地址
  appKey: '4cd90ffb265e44228319f6b83079924d', // 项目唯一的id
  // userId: '18611436666', // 用户id
  getUserId: () => {
    return '1111';
  },
  reportOnlyOnce: true,
  beforeDataReport: data => {
    return {
      ...data,
    };
  },
});

frontMonitor.use(performance);
frontMonitor.use(recordScreen, { recordScreenTypeList: ['error'] });
