import { createLogger, format, transports } from 'winston';
import * as dotenv from 'dotenv';

dotenv.config();

const logPath = process.env.LOG_FILE || './default.log';

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level}]: ${message}`;
        })
    ),
    transports: [
        new transports.File({ filename: logPath, options: { flags: 'a' } })
    ],
});

export default logger;
