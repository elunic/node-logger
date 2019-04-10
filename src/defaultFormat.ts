import * as logform from 'logform';
import * as winston from 'winston';

import { printf } from './printf';

export const defaultFormat: logform.Format = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(printf),
);
