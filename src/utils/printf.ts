import * as logform from 'logform';
import { SPLAT } from 'triple-beam';
import * as util from 'util';

import { levelLabel } from '../levelLabels';

export function printf(info: logform.TransformableInfo) {
  // We can't actually use info.meta because it is not reliably an array.
  // When only one meta parameter has been passed, it is actually just that
  // value, and if that is an array, we can't tell if our array is the
  // meta array or just the value itself.
  // Hence, access the meta directly.
  // [wh]
  const meta = info[SPLAT];

  if (meta) {
    for (const rest of meta) {
      if (typeof rest === 'string') {
        info.message += ' ' + rest;
      } else if (typeof rest === 'number') {
        info.message += ' ' + rest.toString();
      } else if (typeof rest === 'object') {
        if (rest instanceof Error) {
          info.message += ' ' + rest.stack;
        } else {
          info.message += ' ' + util.inspect(rest);
        }
      } else {
        info.message += ' ' + util.inspect(rest);
      }
    }
  }

  const namespace = info.namespace ? ` [${info.namespace}]` : '';
  return `${info.timestamp} ${levelLabel(info.level)}${namespace} ${info.message}`;
}
