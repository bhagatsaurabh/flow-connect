import * as timer from './common/timer';
import * as api from './net/api';
import * as log from './common/log';
import * as buffer from './common/buffer';
import * as normalize from './common/normalize';
import * as toArray from './common/to-array';
import * as lineChartMini from './visual/line-chart-mini';
import * as arrayIndex from './common/array-index';
import * as arraySource from './common/array-source';
import * as random from './common/random';
import * as booleanSource from './common/boolean-source';
import * as jsonSource from './common/json-source';

export namespace StandardNodes {
    export import Timer = timer.Timer;
    export import API = api.API;
    export import Log = log.Log;
    export import Buffer = buffer.Buffer;
    export import Normalize = normalize.Normalize;
    export import ToArray = toArray.ToArray;
    export import LineChartMini = lineChartMini.LineChartMini;
    export import ArrayIndex = arrayIndex.ArrayIndex;
    export import ArraySource = arraySource.ArraySource;
    export import BooleanSource = booleanSource.BooleanSource;
    export import JsonSource = jsonSource.JsonSource;
    export import Random = random.Random;

}
