import * as timer from './common/timer';
import * as log from './common/log';
import * as buffer from './common/buffer';
import * as toArray from './common/to-array';
import * as arrayIndex from './common/array-index';
import * as arraySource from './common/array-source';
import * as random from './common/random';
import * as booleanSource from './common/boolean-source';
import * as jsonSource from './common/json-source';
import * as numberSource from './common/number-source';
import * as stringSource from './common/string-source';
import * as fileSource from './common/file-source';
import * as compare from './common/compare';
import * as property from './common/property';
import * as sync from './common/sync';
import * as delay from './common/delay';
import * as toVector2 from './common/to-vector2';
import * as numberRange from './common/number-range';
import * as globalEvent from './common/global-event';

import * as abs from './math/abs';
import * as average from './math/average';
import * as normalize from './math/normalize';
import * as clamp from './math/clamp';
import * as floor from './math/floor';
import * as ceil from './math/ceil';
import * as func from './math/func';

import * as api from './net/api';

import * as parametricPlotter from './visual/parametric-plotter';
import * as lineChartMini from './visual/line-chart-mini';

export namespace StandardNodes.Common {
  export import Timer = timer.Timer;
  export import Log = log.Log;
  export import Buffer = buffer.Buffer;
  export import ToArray = toArray.ToArray;
  export import ArrayIndex = arrayIndex.ArrayIndex;
  export import ArraySource = arraySource.ArraySource;
  export import BooleanSource = booleanSource.BooleanSource;
  export import JsonSource = jsonSource.JsonSource;
  export import NumberSource = numberSource.NumberSource;
  export import StringSource = stringSource.StringSource;
  export import FileSource = fileSource.FileSource;
  export import Random = random.Random;
  export import Compare = compare.Compare;
  export import Property = property.Property;
  export import Sync = sync.Sync;
  export import Delay = delay.Delay;
  export import ToVector2 = toVector2.ToVector2;
  export import NumberRange = numberRange.NumberRange;
  export import GlobalEvent = globalEvent.GlobalEvent;
}
export namespace StandardNodes.Math {
  export import Abs = abs.Abs;
  export import Average = average.Average;
  export import Normalize = normalize.Normalize;
  export import Clamp = clamp.Clamp;
  export import Floor = floor.Floor;
  export import Ceil = ceil.Ceil;
  export import Function = func.Func;
}
export namespace StandardNodes.Net {
  export import API = api.API;
}
export namespace StandardNodes.Visual {
  export import LineChartMini = lineChartMini.LineChartMini;
  export import ParametricPlotter = parametricPlotter.ParametricPlotter;
}
