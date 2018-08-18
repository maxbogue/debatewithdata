import chalk from 'chalk';
import mapValues from 'lodash/mapValues';
import onFinished from 'on-finished';
import onHeaders from 'on-headers';
import template from 'lodash/template';
import { MESSAGE } from 'triple-beam';
import { createLogger, format, transports } from 'winston';

chalk.enabled = true;
chalk.level = 2;

function colorStatus(status) {
  if (status >= 500) {
    return chalk.red(status);
  } else if (status >= 400) {
    return chalk.yellow(status);
  } else if (status >= 200) {
    return chalk.green(status);
  }
  return status;
}

const transportList = [
  new transports.File({
    level: 'info',
    filename: './logs/dwd-info.log',
    handleExceptions: true,
    maxsize: 2 ** 20 * 5, // 5mb
    maxFiles: 5,
  }),
  new transports.File({
    level: 'error',
    filename: './logs/dwd-error.log',
    handleExceptions: true,
    maxsize: 2 ** 20 * 5, // 5mb
    maxFiles: 5,
  }),
];

if (process.env.NODE_ENV === 'development') {

  /* eslint no-template-curly-in-string: "off" */
  const render = template(
    [
      '[${timestamp}]',
      '${colorStatus(status)}',
      '${method}',
      '${url}',
      '${contentLength}',
      'in ${responseTime}ms',
    ].join(' '),
    { imports: { colorStatus } });

  const expressFormat = format((info) => {
    if (info.exception) {
      info[MESSAGE] = info.message;
    } else if (info.status) {
      info[MESSAGE] = render(info);
    }
    return info;
  });

  transportList.push(new transports.Console({
    format: format.combine(
      format.timestamp(),
      expressFormat()),
    level: 'debug',
    handleExceptions: true,
  }));
}

const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.json()),
  transports: transportList,
  exitOnError: false,
});

function recordStartTime() {
  /* eslint no-invalid-this: "off" */
  this._startAt = process.hrtime();
}

const INFO_FIELDS = {
  status: (req, res) => res.headersSent ? res.statusCode : undefined,
  method: (req) => req.method,
  url: (req) => req.originalUrl,
  ip: (req) => req.ip,
  user: (req) => req.user ? req.user.username : undefined,
  responseTime: (req, res) => {
    if (!req._startAt || !res._startAt) {
      return undefined;
    }
    let ms = (res._startAt[0] - req._startAt[0]) * 1e3
        + (res._startAt[1] - req._startAt[1]) * 1e-6;
    return ms.toFixed(3);
  },
  contentLength: (req, res) => res.getHeader('content-length'),
};

function statusToLogLevel(status) {
  if (status >= 500) {
    return 'error';
  } else if (status >= 400) {
    return 'warn';
  }
  return 'info';
}

export default function expressLogger(req, res, next) {
  recordStartTime.call(req);
  onHeaders(res, recordStartTime);
  onFinished(res, () => {
    let info = mapValues(INFO_FIELDS, (f) => f(req, res));
    let logLevel = statusToLogLevel(info.status);
    logger.log(logLevel, info);
  });
  next();
}
