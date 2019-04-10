import * as logform from 'logform';
import { MESSAGE } from 'triple-beam';

import { defaultFormat } from '../defaultFormat';

export function messageFormatter(
  info: logform.TransformableInfo,
  format: logform.Format = defaultFormat,
): string {
  const transformed = format.transform(info);

  if (!transformed) {
    return '';
  }

  return (transformed as logform.TransformableInfo)[MESSAGE];
}
