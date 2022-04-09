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
import * as syncEvent from './common/sync-event';
import * as syncData from './common/sync-data';
import * as delay from './common/delay';
import * as toVector from './common/to-vector';
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

import * as functionPlotter from './visual/function-plotter';
import * as lineChartMini from './visual/line-chart-mini';

import * as source from './audio/source';
import * as destination from './audio/destination';
import * as automate from './audio/automate';
import * as channelSplitter from './audio/channel-splitter';
import * as debug from './audio/debug';
import * as channelMerger from './audio/channel-merger';
import * as adsr from './audio/adsr';
import * as gain from './audio/gain';
import * as metronome from './audio/metronome';
import * as moogEffect from './audio/moog';
import * as bitcrusherEffect from './audio/bitcrusher';
import * as biquadFilter from './audio/biquad-filter';
import * as delayEffect from './audio/delay';
import * as dynamicsCompressor from './audio/dynamics-compressor';
import * as chorusEffect from './audio/chorus';
import * as overdriveEffect from './audio/overdrive';
import * as audioBuffer from './audio/audio-buffer-source';
import * as convolver from './audio/convolver';
import * as tremoloEffect from './audio/tremolo';
import * as pingPong from './audio/ping-pong-delay';
import * as stereoPanner from './audio/stereo-panner';
import * as spatialPanner from './audio/spatial-panner';
import * as noise from './audio/noise';
import * as oscillator from './audio/oscillator';
import * as microphone from './audio/microphone';
import * as distorter from './audio/distorter';
import * as equalizer from './audio/equalizer';
import * as frequencyAnalyser from './audio/frequency-analyser';
import * as waveformAnalyser from './audio/waveform-analyser';
import * as spectrogramAnalyser from './audio/spectrogram-analyser';

import * as dial from './ui/dial';

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
  export import SyncEvent = syncEvent.SyncEvent;
  export import SyncData = syncData.SyncData;
  export import Delay = delay.Delay;
  export import ToVector = toVector.ToVector;
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
  export import FunctionPlotter = functionPlotter.FunctionPlotter;
}
export namespace StandardNodes.Audio {
  export import Source = source.Source;
  export import Destination = destination.Destination;
  export import Automate = automate.Automate;
  export import ChannelSplitter = channelSplitter.ChannelSplitter;
  export import Debug = debug.Debug;
  export import ChannelMerger = channelMerger.ChannelMerger;
  export import ADSR = adsr.ADSR;
  export import Gain = gain.Gain;
  export import Metronome = metronome.Metronome;
  export import MoogEffect = moogEffect.MoogEffect;
  export import BitcrusherEffect = bitcrusherEffect.BitcrusherEffect;
  export import BiquadFilter = biquadFilter.BiquadFilter;
  export import DelayEffect = delayEffect.DelayEffect;
  export import DynamicsCompressor = dynamicsCompressor.DynamicsCompressor;
  export import ChorusEffect = chorusEffect.ChorusEffect;
  export import OverdriveEffect = overdriveEffect.OverdriveEffect;
  export import AudioBufferSource = audioBuffer.AudioBufferSource;
  export import Convolver = convolver.Convolver;
  export import TremoloEffect = tremoloEffect.TremoloEffect;
  export import PingPongDelay = pingPong.PingPongEffect;
  export import StereoPanner = stereoPanner.StereoPanner;
  export import SpatialPanner = spatialPanner.SpatialPanner;
  export import Noise = noise.Noise;
  export import Oscillator = oscillator.Oscillator;
  export import Microphone = microphone.Microphone;
  export import Distorter = distorter.Distorter;
  export import Equalizer = equalizer.Equalizer;
  export import FrequencyAnalyser = frequencyAnalyser.FrequencyAnalyser;
  export import WaveformAnalyser = waveformAnalyser.WaveformAnalyser;
  export import SpectrogramAnalyser = spectrogramAnalyser.SpectrogramAnalyser;
}
export namespace StandardNodes.UI {
  export import Dial = dial.Dial;
}
export namespace StandardNodes.Image {

}
