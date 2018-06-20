import { createLogger, format, transports } from 'winston';

export default createLogger({
  transports: [
    new transports.File({
      level: 'info',
      filename: './logs/dwd.log',
      handleExceptions: true,
      maxsize: 2 ** 20 * 5, // 5mb
      maxFiles: 5,
      format: format.combine(
          format.timestamp(),
          format.json(),
      ),
    }),
    new transports.Console({
      level: 'debug',
      handleExceptions: true,
      format: format.combine(
          format.timestamp(),
          format.colorize(),
          format.simple(),
      ),
    })
  ],
  exitOnError: false,
});
