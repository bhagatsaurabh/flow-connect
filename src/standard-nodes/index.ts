import * as timer from './basic/timer';
import * as api from './comms/api';
import * as log from './basic/log';

export namespace StandardNodes {
    export import Timer = timer.Timer;
    export import API = api.API;
    export import Log = log.Log;
}