import * as timer from './basic/timer';
import * as api from './comms/api';
import * as log from './basic/log';
import * as buffer from './basic/buffer';
import * as normalize from './basic/normalize';
import * as toArray from './basic/to-array';
import * as lineChartMini from './visual/line-chart-mini';

export namespace StandardNodes {
    export import Timer = timer.Timer;
    export import API = api.API;
    export import Log = log.Log;
    export import Buffer = buffer.Buffer;
    export import Normalize = normalize.Normalize;
    export import ToArray = toArray.ToArray;
    export import LineChartMini = lineChartMini.LineChartMini;
}
