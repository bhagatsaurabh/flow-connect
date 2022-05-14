import * as timer from './common/timer.js';
import * as log from './common/log.js';
import * as buffer from './common/buffer.js';
import * as toArray from './common/to-array.js';
import * as arrayIndex from './common/array-index.js';
import * as arraySource from './common/array-source.js';
import * as random from './common/random.js';
import * as booleanSource from './common/boolean-source.js';
import * as jsonSource from './common/json-source.js';
import * as numberSource from './common/number-source.js';
import * as stringSource from './common/string-source.js';
import * as fileSource from './common/file-source.js';
import * as compare from './common/compare.js';
import * as property from './common/property.js';
import * as syncEvent from './common/sync-event.js';
import * as syncData from './common/sync-data.js';
import * as delay from './common/delay.js';
import * as toVector from './common/to-vector.js';
import * as numberRange from './common/number-range.js';
import * as globalEvent from './common/global-event.js';

import * as abs from './math/abs.js';
import * as average from './math/average.js';
import * as normalize from './math/normalize.js';
import * as clamp from './math/clamp.js';
import * as floor from './math/floor.js';
import * as ceil from './math/ceil.js';
import * as func from './math/func.js';

import * as api from './net/api.js';

import * as functionPlotter from './visual/function-plotter.js';
import * as lineChartMini from './visual/line-chart-mini.js';

import * as source from './audio/source.js';
import * as destination from './audio/destination.js';
import * as automate from './audio/automate.js';
import * as channelSplitter from './audio/channel-splitter.js';
import * as debug from './audio/debug.js';
import * as channelMerger from './audio/channel-merger.js';
import * as adsr from './audio/adsr.js';
import * as gain from './audio/gain.js';
import * as metronome from './audio/metronome.js';
import * as moogEffect from './audio/moog.js';
import * as bitcrusherEffect from './audio/bitcrusher.js';
import * as biquadFilter from './audio/biquad-filter.js';
import * as delayEffect from './audio/delay.js';
import * as dynamicsCompressor from './audio/dynamics-compressor.js';
import * as chorusEffect from './audio/chorus.js';
import * as overdriveEffect from './audio/overdrive.js';
import * as audioBuffer from './audio/audio-buffer-source.js';
import * as convolver from './audio/convolver.js';
import * as tremoloEffect from './audio/tremolo.js';
import * as pingPong from './audio/ping-pong-delay.js';
import * as stereoPanner from './audio/stereo-panner.js';
import * as spatialPanner from './audio/spatial-panner.js';
import * as noise from './audio/noise.js';
import * as oscillator from './audio/oscillator.js';
import * as microphone from './audio/microphone.js';
import * as distorter from './audio/distorter.js';
import * as equalizer from './audio/equalizer.js';
import * as frequencyAnalyser from './audio/frequency-analyser.js';
import * as waveformAnalyser from './audio/waveform-analyser.js';
import * as spectrogramAnalyser from './audio/spectrogram-analyser.js';

import * as dial from './ui/dial.js';

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
