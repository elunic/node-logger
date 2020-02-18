import * as logform from 'logform';
import { MESSAGE } from 'triple-beam';

export function cloudwatchMessageFormatterFactory(format: logform.Format) {
  return function cloudwatchMessageFormatter(info: logform.TransformableInfo): string {
    const transformed = format.transform(info);

    if (!transformed) {
      return '';
    }

    return (transformed as logform.TransformableInfo)[MESSAGE];
  };
}
