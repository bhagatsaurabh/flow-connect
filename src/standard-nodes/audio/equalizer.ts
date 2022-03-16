import { Flow } from "../../core/flow";
import { Vector } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { clamp, isInRange } from "../../utils/utils";
import { Node } from '../../core/node';
import { Align } from "../../common/enums";
import { Toggle, VSlider, Stack } from "../../ui/index";

export class Equalizer extends Node {
  vSliders: VSlider[] = [];
  filters: BiquadFilterNode[] = [];
  bypassToggle: Toggle;
  inGain: GainNode;
  outGain: GainNode;

  frequencies = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
  freqDisplay = ['32', '64', '125', '250', '500', '1K', '2K', '4K', '8K', '16K']

  static DefaultState = { eq1: 0, eq2: 0, eq3: 0, eq4: 0, eq5: 0, eq6: 0, eq7: 0, eq8: 0, eq9: 0, eq10: 0, bypass: false };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(
      flow, options.name || 'Equalizer',
      options.position || new Vector(50, 50),
      options.width || 300,
      [{ name: 'in', dataType: 'audio' }], [{ name: 'out', dataType: 'audio' }],
      {
        style: options.style || { rowHeight: 10, spacing: 10 },
        terminalStyle: options.terminalStyle || {},
        state: options.state ? { ...Equalizer.DefaultState, ...options.state } : Equalizer.DefaultState
      }
    )

    this.inGain = flow.flowConnect.audioContext.createGain();
    this.outGain = flow.flowConnect.audioContext.createGain();
    this.frequencies.forEach((freq, index) => {
      let filter = flow.flowConnect.audioContext.createBiquadFilter();
      filter.frequency.value = freq;
      if (index === 0)
        filter.type = 'lowshelf';
      else if (index === 9)
        filter.type = 'highshelf';
      else
        filter.type = 'peaking';
      this.filters.push(filter);
    });
    for (let i = 1; i < 10; ++i) {
      this.filters[i - 1].connect(this.filters[i]);
    }

    this.inputs[0].ref = this.inGain;
    this.outputs[0].ref = this.outGain;

    this.setBypass();

    this.setupUI();

    this.watch('bypass', this.setBypass.bind(this));
    for (let i = 1; i <= 10; ++i) {
      this.watch(`eq${i}`, (_oldVal, newVal) => {
        if (!isInRange(newVal, -40, 40)) {
          this.state[`eq${i}`] = clamp(newVal, -40, 40);
        }
        this.filters[i - 1].gain.value = this.state[`eq${i}`]
      });
    }

    this.handleAudioConnections();
  }

  setBypass() {
    if (!this.state.bypass) {
      this.inGain.disconnect();
      this.inGain.connect(this.filters[0]);
      this.filters[9].connect(this.outGain);
    } else {
      this.inGain.disconnect();
      this.filters[9].disconnect();
      this.inGain.connect(this.outGain);
    }
  }
  setupUI() {
    let stacks: Stack[] = [];
    this.frequencies.forEach((_freq, index) => {
      let vSlider = this.createVSlider(-40, 40, { height: 120, propName: `eq${index + 1}` });
      this.vSliders.push(vSlider);
      let stack = this.createStack({
        childs: [
          this.createLabel(this.freqDisplay[index], { style: { align: Align.Center } }),
          vSlider,
          this.createLabel(this.state[`eq${index + 1}`], { propName: `eq${index + 1}`, style: { align: Align.Center, precision: 0 } }),
        ],
        style: { grow: .1, spacing: 5 }
      });
      stacks.push(stack);
    });
    this.bypassToggle = this.createToggle({ propName: 'bypass', height: 10, style: { grow: .1 } });
    this.ui.append([
      this.createHozLayout(stacks, { style: { spacing: 5 } }),
      this.createHozLayout([this.createLabel('Bypass ?'), this.bypassToggle], { style: { spacing: 5 } })
    ]);
  }
  handleAudioConnections() {
    this.outputs[0].on('connect', (_inst, connector) => this.outputs[0].ref.connect(connector.end.ref));
    this.outputs[0].on('disconnect', (_inst, _connector, _start, end) => this.outputs[0].ref.disconnect(end.ref));
  }
}
