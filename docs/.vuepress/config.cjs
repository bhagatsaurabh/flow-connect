const markdownItAttrs = require('markdown-it-attrs');
const { path } = require('@vuepress/utils')
const { defaultTheme, viteBundler } = require('vuepress');
const { searchPlugin } = require('@vuepress/plugin-search');
const { mediumZoomPlugin } = require('@vuepress/plugin-medium-zoom');
const { registerComponentsPlugin } = require('@vuepress/plugin-register-components');

let base = '/';
if (process.env.DOCS_CONTEXT === 'GitHub') {
  base = '/flow-connect/';
}
console.log('Base URL:', base);

module.exports = {
  bundler: viteBundler(),
  // site config
  lang: 'en-US',
  title: 'Flow Connect',
  description: 'A lightweight yet powerful library for creating node-based visual programming interfaces.',
  head: [
    ['base', { href: base }],
    ['link', { rel: 'icon', href: 'images/logo.png' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/flow-connect@1.0.12/dist/flow-connect.js' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/flow-connect@1.0.12/dist/flow-connect.js.map', type: 'application/json' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/@flow-connect/common@latest/dist/common.js' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/@flow-connect/common@latest/dist/common.js.map' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/@flow-connect/visual@latest/dist/visual.js' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/@flow-connect/visual@latest/dist/visual.js.map' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/@flow-connect/ui@latest/dist/ui.js' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/@flow-connect/ui@latest/dist/ui.js.map' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/@flow-connect/net@latest/dist/net.js' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/@flow-connect/net@latest/dist/net.js.map' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/@flow-connect/math@latest/dist/math.js' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/@flow-connect/math@latest/dist/math.js.map' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/@flow-connect/audio@latest/dist/audio.js' }],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/@flow-connect/audio@latest/dist/audio.js.map' }],
    ['script', { src: 'example/custom-nodes.js' }]
  ],
  base,

  // theme and its config
  theme: defaultTheme({
    logo: '/images/logo.png',
    smoothScroll: true,
    navbar: [
      { text: 'Guide', link: '/guide/' },
      // { text: 'Examples', link: '/examples/' },
      {
        text: 'Reference', children: [
          { text: 'Flow Connect', children: [{ text: 'API', link: '/reference/api/classes/flow-connect' }] },
          {
            text: 'Standard Nodes', children: [
              { text: 'Common', link: '/reference/standard-nodes/common/' },
              { text: 'Audio', link: '/reference/standard-nodes/audio/' },
              { text: 'Math', link: '/reference/standard-nodes/math/' },
              { text: 'Net', link: '/reference/standard-nodes/net/' },
              { text: 'UI', link: '/reference/standard-nodes/ui/' },
              { text: 'Visual', link: '/reference/standard-nodes/visual/' }
            ]
          }
        ]
      },
      { text: 'v1.0.12', link: '/' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          children: [
            '/guide/README.md',
            '/guide/get-started.md',
            '/guide/setup.md',
            '/guide/flow.md',
            '/guide/nodes.md',
            '/guide/node-ui.md',
            '/guide/connect.md',
            '/guide/sub-flows.md'
          ]
        }
      ],
      '/reference/api/': [
        {
          text: 'Classes',
          collapsible: true,
          children: [
            { text: 'FlowConnect', link: '/reference/api/classes/flow-connect.md' },
            { text: 'Color', link: '/reference/api/classes/color.md' },
            { text: 'Connector', link: '/reference/api/classes/connector.md' },
            { text: 'Flow', link: '/reference/api/classes/flow.md' },
            { text: 'Graph', link: '/reference/api/classes/graph.md' },
            { text: 'GraphNode', link: '/reference/api/classes/graph-node.md' },
            { text: 'Group', link: '/reference/api/classes/group.md' },
            { text: 'Hooks', link: '/reference/api/classes/hooks.md' },
            { text: 'Node', link: '/reference/api/classes/node.md' },
            { text: 'NodeButton', link: '/reference/api/classes/node-button.md' },
            { text: 'SubFlowNode', link: '/reference/api/classes/subflow-node.md' },
            { text: 'Terminal', link: '/reference/api/classes/terminal.md' },
            { text: 'TunnelNode', link: '/reference/api/classes/tunnel-node.md' },
            { text: 'Vector', link: '/reference/api/classes/vector.md' },
            { text: 'UINode', link: '/reference/api/classes/ui-node.md' }
          ],
        },
        {
          text: 'Node UI',
          collapsible: true,
          children: [
            { text: 'Slider2D', link: '/reference/api/nodeui/slider2d.md' },
            { text: 'Button', link: '/reference/api/nodeui/button.md' },
            { text: 'Container', link: '/reference/api/nodeui/container.md' },
            { text: 'Dial', link: '/reference/api/nodeui/dial.md' },
            { text: 'Display', link: '/reference/api/nodeui/display.md' },
            { text: 'Envelope', link: '/reference/api/nodeui/envelope.md' },
            { text: 'HorizontalLayout', link: '/reference/api/nodeui/horizontal-layout.md' },
            { text: 'Image', link: '/reference/api/nodeui/image.md' },
            { text: 'Input', link: '/reference/api/nodeui/input.md' },
            { text: 'Label', link: '/reference/api/nodeui/label.md' },
            { text: 'RadioGroup', link: '/reference/api/nodeui/radio-group.md' },
            { text: 'Select', link: '/reference/api/nodeui/select.md' },
            { text: 'Slider', link: '/reference/api/nodeui/slider.md' },
            { text: 'Source', link: '/reference/api/nodeui/source.md' },
            { text: 'Stack', link: '/reference/api/nodeui/stack.md' },
            { text: 'Toggle', link: '/reference/api/nodeui/toggle.md' },
            { text: 'VSlider', link: '/reference/api/nodeui/v-slider.md' }
          ],
        },
        {
          text: 'Interfaces',
          collapsible: true,
          children: [
            {
              text: 'Style',
              collapsible: true,
              children: [
                { text: 'ButtonStyle', link: '/reference/api/interfaces/button-style.md' },
                { text: 'ConnectorStyle', link: '/reference/api/interfaces/connector-style.md' },
                { text: 'ContainerStyle', link: '/reference/api/interfaces/container-style.md' },
                { text: 'DialStyle', link: '/reference/api/interfaces/dial-style.md' },
                { text: 'DisplayStyle', link: '/reference/api/interfaces/display-style.md' },
                { text: 'EnvelopeStyle', link: '/reference/api/interfaces/envelope-style.md' },
                { text: 'GroupStyle', link: '/reference/api/interfaces/group-style.md' },
                { text: 'HorizontalLayoutStyle', link: '/reference/api/interfaces/horizontal-layout-style.md' },
                { text: 'ImageStyle', link: '/reference/api/interfaces/image-style.md' },
                { text: 'InputStyle', link: '/reference/api/interfaces/input-style.md' },
                { text: 'LabelStyle', link: '/reference/api/interfaces/label-style.md' },
                { text: 'NodeStyle', link: '/reference/api/interfaces/node-style.md' },
                { text: 'PlotStyle', link: '/reference/api/interfaces/plot-style.md' },
                { text: 'RadioGroupStyle', link: '/reference/api/interfaces/radio-group-style.md' },
                { text: 'SelectStyle', link: '/reference/api/interfaces/select-style.md' },
                { text: 'Slider2DStyle', link: '/reference/api/interfaces/slider2d-style.md' },
                { text: 'SliderStyle', link: '/reference/api/interfaces/slider-style.md' },
                { text: 'SourceStyle', link: '/reference/api/interfaces/source-style.md' },
                { text: 'StackStyle', link: '/reference/api/interfaces/stack-style.md' },
                { text: 'TerminalStyle', link: '/reference/api/interfaces/terminal-style.md' },
                { text: 'ToggleStyle', link: '/reference/api/interfaces/toggle-style.md' },
                { text: 'UINodeStyle', link: '/reference/api/interfaces/ui-node-style.md' },
                { text: 'VSliderStyle', link: '/reference/api/interfaces/v-slider-style.md' }
              ],
            },
            {
              text: 'Options',
              collapsible: true,
              children: [
                { text: 'VSliderOptions', link: '/reference/api/interfaces/v-slider-options.md' },
                { text: 'VSliderCreatorOptions', link: '/reference/api/interfaces/v-slider-creator-options.md' },
                { text: 'StackOptions', link: '/reference/api/interfaces/stack-options.md' },
                { text: 'StackCreatorOptions', link: '/reference/api/interfaces/stack-creator-options.md' },
                { text: 'SourceOptions', link: '/reference/api/interfaces/source-options.md' },
                { text: 'SourceCreatorOptions', link: '/reference/api/interfaces/source-creator-options.md' },
                { text: 'SliderOptions', link: '/reference/api/interfaces/slider-options.md' },
                { text: 'SliderCreatorOptions', link: '/reference/api/interfaces/slider-creator-options.md' },
                { text: 'SelectOptions', link: '/reference/api/interfaces/select-options.md' },
                { text: 'SelectCreatorOptions', link: '/reference/api/interfaces/select-creator-options.md' },
                { text: 'RadioGroupOptions', link: '/reference/api/interfaces/radio-group-options.md' },
                { text: 'RadioGroupCreatorOptions', link: '/reference/api/interfaces/radio-group-creator-options.md' },
                { text: 'LabelOptions', link: '/reference/api/interfaces/label-options.md' },
                { text: 'LabelCreatorOptions', link: '/reference/api/interfaces/label-creator-options.md' },
                { text: 'InputOptions', link: '/reference/api/interfaces/input-options.md' },
                { text: 'InputCreatorOptions', link: '/reference/api/interfaces/input-creator-options.md' },
                { text: 'ImageOptions', link: '/reference/api/interfaces/image-options.md' },
                { text: 'ImageCreatorOptions', link: '/reference/api/interfaces/image-creator-options.md' },
                { text: 'HorizontalLayoutOptions', link: '/reference/api/interfaces/horizontal-layout-options.md' },
                { text: 'HorizontalLayoutCreatorOptions', link: '/reference/api/interfaces/horizontal-layout-creator-options.md' },
                { text: 'EnvelopeOptions', link: '/reference/api/interfaces/envelope-options.md' },
                { text: 'EnvelopeCreatorOptions', link: '/reference/api/interfaces/envelope-creator-options.md' },
                { text: 'DisplayOptions', link: '/reference/api/interfaces/display-options.md' },
                { text: 'DisplayCreatorOptions', link: '/reference/api/interfaces/display-creator-options.md' },
                { text: 'DialOptions', link: '/reference/api/interfaces/dial-options.md' },
                { text: 'DialCreatorOptions', link: '/reference/api/interfaces/dial-creator-options.md' },
                { text: 'ContainerOptions', link: '/reference/api/interfaces/container-options.md' },
                { text: 'Slider2DOptions', link: '/reference/api/interfaces/slider2d-options.md' },
                { text: 'Slider2DCreatorOptions', link: '/reference/api/interfaces/slider2d-creator-options.md' },
                { text: 'ButtonOptions', link: '/reference/api/interfaces/button-options.md' },
                { text: 'ButtonCreatorOptions', link: '/reference/api/interfaces/button-creator-options.md' },
                { text: 'ConnectorOptions', link: '/reference/api/interfaces/connector-options.md' },
                { text: 'FlowOptions', link: '/reference/api/interfaces/flow-options.md' },
                { text: 'GroupOptions', link: '/reference/api/interfaces/group-options.md' },
                { text: 'NodeConstructorOptions', link: '/reference/api/interfaces/node-constructor-options.md' },
                { text: 'NodeCreatorOptions', link: '/reference/api/interfaces/node-creator-options.md' },
                { text: 'NodeOptions', link: '/reference/api/interfaces/node-options.md' },
                { text: 'SubFlowOptions', link: '/reference/api/interfaces/sub-flow-options.md' },
                { text: 'TerminalOptions', link: '/reference/api/interfaces/terminal-options.md' },
                { text: 'ToggleOptions', link: '/reference/api/interfaces/toggle-options.md' },
                { text: 'ToggleCreatorOptions', link: '/reference/api/interfaces/toggle-creator-options.md' },
                { text: 'TunnelNodeOptions', link: '/reference/api/interfaces/tunnel-node-options.md' }
              ],
            },
            {
              text: 'Serialized',
              collapsible: true,
              children: [
                { text: 'SerializedButton', link: '/reference/api/interfaces/serialized-button.md' },
                { text: 'SerializedColor', link: '/reference/api/interfaces/serialized-color.md' },
                { text: 'SerializedConnector', link: '/reference/api/interfaces/serialized-connector.md' },
                { text: 'SerializedContainer', link: '/reference/api/interfaces/serialized-container.md' },
                { text: 'SerializedDial', link: '/reference/api/interfaces/serialized-dial.md' },
                { text: 'SerializedDisplay', link: '/reference/api/interfaces/serialized-display.md' },
                { text: 'SerializedEnvelope', link: '/reference/api/interfaces/serialized-envelope.md' },
                { text: 'SerializedFlow', link: '/reference/api/interfaces/serialized-flow.md' },
                { text: 'SerializedGraph', link: '/reference/api/interfaces/serialized-graph.md' },
                { text: 'SerializedGraphNode', link: '/reference/api/interfaces/serialized-graph-node.md' },
                { text: 'SerializedGroup', link: '/reference/api/interfaces/serialized-group.md' },
                { text: 'SerializedHorizontalLayout', link: '/reference/api/interfaces/serialized-horizontal-layout.md' },
                { text: 'SerializedImage', link: '/reference/api/interfaces/serialized-image.md' },
                { text: 'SerializedInput', link: '/reference/api/interfaces/serialized-input.md' },
                { text: 'SerializedLabel', link: '/reference/api/interfaces/serialized-label.md' },
                { text: 'SerializedNode', link: '/reference/api/interfaces/serialized-node.md' },
                { text: 'SerializedRadioGroup', link: '/reference/api/interfaces/serialized-radio-group.md' },
                { text: 'SerializedSelect', link: '/reference/api/interfaces/serialized-select.md' },
                { text: 'SerializedSlider', link: '/reference/api/interfaces/serialized-slider.md' },
                { text: 'SerializedSlider2D', link: '/reference/api/interfaces/serialized-slider2d.md' },
                { text: 'SerializedSource', link: '/reference/api/interfaces/serialized-source.md' },
                { text: 'SerializedStackLayout', link: '/reference/api/interfaces/serialized-stack-layout.md' },
                { text: 'SerializedTerminal', link: '/reference/api/interfaces/serialized-terminal.md' },
                { text: 'SerializedToggle', link: '/reference/api/interfaces/serialized-toggle.md' },
                { text: 'SerializedTunnelNode', link: '/reference/api/interfaces/serialized-tunnel-node.md' },
                { text: 'SerializedUINode', link: '/reference/api/interfaces/serialized-ui-node.md' },
                { text: 'SerializedVSlider', link: '/reference/api/interfaces/serialized-v-slider.md' },
                { text: 'SerializedVector', link: '/reference/api/interfaces/serialized-vector.md' },
              ],
            },
            {
              text: 'Render Params',
              collapsible: true,
              children: [
                { text: 'ConnectorRenderParams', link: '/reference/api/interfaces/connector-render-params.md' },
                { text: 'ContainerRenderParams', link: '/reference/api/interfaces/container-render-params.md' },
                { text: 'GroupRenderParams', link: '/reference/api/interfaces/group-render-params.md' },
                { text: 'NodeButtonRenderParams', link: '/reference/api/interfaces/node-button-render-params.md' },
                { text: 'NodeRenderParams', link: '/reference/api/interfaces/node-render-params.md' },
                { text: 'TerminalRenderParams', link: '/reference/api/interfaces/terminal-render-params.md' },
                { text: 'UINodeRenderParams', link: '/reference/api/interfaces/ui-node-render-params.md' },
              ],
            },
            {
              text: 'Config',
              collapsible: true,
              children: [
                { text: 'CustomOffCanvasConfig', link: '/reference/api/interfaces/custom-offcanvas-config.md' },
                { text: 'CustomRendererConfig', link: '/reference/api/interfaces/custom-renderer-config.md' }
              ],
            },
            { text: 'Dimension', link: '/reference/api/interfaces/dimension.md' },
            { text: 'Pointer', link: '/reference/api/interfaces/pointer.md' },
            { text: 'Renderable', link: '/reference/api/interfaces/renderable.md' },
            { text: 'RenderFunction', link: '/reference/api/interfaces/render-function.md' },
            { text: 'RenderResolver', link: '/reference/api/interfaces/render-resolver.md' },
            { text: 'RenderState', link: '/reference/api/interfaces/render-state.md' },
            { text: 'Rules', link: '/reference/api/interfaces/rules.md' },
            { text: 'Serializable', link: '/reference/api/interfaces/serializable.md' },
          ],
        },
        {
          text: 'Enums',
          collapsible: true,
          children: [
            { text: 'Align', link: '/reference/api/enums/align.md' },
            { text: 'CanvasType', link: '/reference/api/enums/canvas-type.md' },
            { text: 'FlowConnectState', link: '/reference/api/enums/flow-connect-state.md' },
            { text: 'FlowState', link: '/reference/api/enums/flow-state.md' },
            { text: 'GlobalEventType', link: '/reference/api/enums/global-event-type.md' },
            { text: 'InputType', link: '/reference/api/enums/input-type.md' },
            { text: 'LOD', link: '/reference/api/enums/lod.md' },
            { text: 'LogLevel', link: '/reference/api/enums/log-level.md' },
            { text: 'NodeState', link: '/reference/api/enums/node-state.md' },
            { text: 'TerminalType', link: '/reference/api/enums/terminal-type.md' },
            { text: 'UIType', link: '/reference/api/enums/ui-type.md' },
            { text: 'ViewPort', link: '/reference/api/enums/viewport.md' }
          ],
        }
      ],
      '/reference/standard-nodes/': [
        {
          text: 'Common', collapsible: true, children: [
            { text: 'ArrayIndex', link: '/reference/standard-nodes/common/array-index' },
            { text: 'ArraySource', link: '/reference/standard-nodes/common/array-source' },
            { text: 'BooleanSource', link: '/reference/standard-nodes/common/boolean-source' },
            { text: 'Buffer', link: '/reference/standard-nodes/common/buffer' },
            { text: 'Compare', link: '/reference/standard-nodes/common/compare' },
            { text: 'Delay', link: '/reference/standard-nodes/common/delay' },
            { text: 'FileSource', link: '/reference/standard-nodes/common/file-source' },
            { text: 'GlobalEvent', link: '/reference/standard-nodes/common/global-event' },
            { text: 'JSONSource', link: '/reference/standard-nodes/common/json-source' },
            { text: 'Log', link: '/reference/standard-nodes/common/log' },
            { text: 'NumberRange', link: '/reference/standard-nodes/common/number-range' },
            { text: 'NumberSource', link: '/reference/standard-nodes/common/number-source' },
            { text: 'Property', link: '/reference/standard-nodes/common/property' },
            { text: 'Random', link: '/reference/standard-nodes/common/random' },
            { text: 'StringSource', link: '/reference/standard-nodes/common/string-source' },
            { text: 'SyncData', link: '/reference/standard-nodes/common/sync-data' },
            { text: 'SyncEvent', link: '/reference/standard-nodes/common/sync-event' },
            { text: 'Timer', link: '/reference/standard-nodes/common/timer' },
            { text: 'ToArray', link: '/reference/standard-nodes/common/to-array' },
            { text: 'ToVector', link: '/reference/standard-nodes/common/to-vector' },
          ]
        },
        {
          text: 'Math', collapsible: true, children: [
            { text: 'Abs', link: '/reference/standard-nodes/math/abs' },
            { text: 'Average', link: '/reference/standard-nodes/math/average' },
            { text: 'Ceil', link: '/reference/standard-nodes/math/ceil' },
            { text: 'Clamp', link: '/reference/standard-nodes/math/clamp' },
            { text: 'Floor', link: '/reference/standard-nodes/math/floor' },
            { text: 'Func', link: '/reference/standard-nodes/math/func' },
            { text: 'Normalize', link: '/reference/standard-nodes/math/normalize' }
          ]
        },
        {
          text: 'Net', collapsible: true, children: [
            { text: "API", link: "/reference/standard-nodes/net/api" }
          ]
        },
        {
          text: 'UI', collapsible: true, children: [
            { text: "Dial", link: "/reference/standard-nodes/ui/dial" }
          ]
        },
        {
          text: 'Audio', collapsible: true, children: [
            { text: 'ADSR', link: '/reference/standard-nodes/audio/adsr' },
            { text: 'AudioBufferSource', link: '/reference/standard-nodes/audio/audio-buffer-source' },
            { text: 'Automate', link: '/reference/standard-nodes/audio/automate' },
            { text: 'BiquadFilter', link: '/reference/standard-nodes/audio/biquad-filter' },
            { text: 'Bitcrusher', link: '/reference/standard-nodes/audio/bitcrusher' },
            { text: 'ChannelMerger', link: '/reference/standard-nodes/audio/channel-merger' },
            { text: 'ChannelSplitter', link: '/reference/standard-nodes/audio/channel-splitter' },
            { text: 'Chorus', link: '/reference/standard-nodes/audio/chorus' },
            { text: 'Convolver', link: '/reference/standard-nodes/audio/convolver' },
            { text: 'Debug', link: '/reference/standard-nodes/audio/debug' },
            { text: 'Delay', link: '/reference/standard-nodes/audio/delay' },
            { text: 'Destination', link: '/reference/standard-nodes/audio/destination' },
            { text: 'Distorter', link: '/reference/standard-nodes/audio/distorter' },
            { text: 'DynamicsCompressor', link: '/reference/standard-nodes/audio/dynamics-compressor' },
            { text: 'Equalizer', link: '/reference/standard-nodes/audio/equalizer' },
            { text: 'FrequencyAnalyser', link: '/reference/standard-nodes/audio/frequency-analyser' },
            { text: 'Gain', link: '/reference/standard-nodes/audio/gain' },
            { text: 'Metronome', link: '/reference/standard-nodes/audio/metronome' },
            { text: 'Microphone', link: '/reference/standard-nodes/audio/microphone' },
            { text: 'Moog', link: '/reference/standard-nodes/audio/moog' },
            { text: 'Noise', link: '/reference/standard-nodes/audio/noise' },
            { text: 'Oscillator', link: '/reference/standard-nodes/audio/oscillator' },
            { text: 'Overdrive', link: '/reference/standard-nodes/audio/overdrive' },
            { text: 'PingPongDelay', link: '/reference/standard-nodes/audio/ping-pong-delay' },
            { text: 'Source', link: '/reference/standard-nodes/audio/source' },
            { text: 'SpatialPanner', link: '/reference/standard-nodes/audio/spatial-panner' },
            { text: 'SpectrogramAnalyser', link: '/reference/standard-nodes/audio/spectrogram-analyser' },
            { text: 'StereoPanner', link: '/reference/standard-nodes/audio/stereo-panner' },
            { text: 'Tremolo', link: '/reference/standard-nodes/audio/tremolo' },
            { text: 'WaveformAnalyser', link: '/reference/standard-nodes/audio/waveform-analyser' }
          ]
        },
        {
          text: 'Visual', collapsible: true, children: [
            { text: "FunctionPlotter", link: "/reference/standard-nodes/visual/function-plotter" },
            { text: "LineChartMini", link: "/reference/standard-nodes/visual/line-chart-mini" }
          ]
        }
      ]
    },
    repo: 'saurabh-prosoft/flow-connect',
    lastUpdated: true,
    search: true,
    docsRepo: 'saurabh-prosoft/flow-connect',
    docsDir: 'docs',
    docsBranch: 'master',
    editLinks: true
  }),
  extendsMarkdown: (md) => {
    md.use(markdownItAttrs)
  },
  plugins: [
    searchPlugin({
      getExtraFields: (page) => page.frontmatter.tags ?? [],
    }),
    mediumZoomPlugin({
      selector: 'img.zoomable'
    }),
    registerComponentsPlugin({
      components: {
        Enum: path.resolve(__dirname, './components/api/Enum.vue'),
        Event: path.resolve(__dirname, './components/api/Event.vue'),
        Function: path.resolve(__dirname, './components/api/Function.vue'),
        Hierarchy: path.resolve(__dirname, './components/api/Hierarchy.vue'),
        Icon: path.resolve(__dirname, './components/api/Icon.vue'),
        Method: path.resolve(__dirname, './components/api/Method.vue'),
        Optional: path.resolve(__dirname, './components/api/Optional.vue'),
        Overview: path.resolve(__dirname, './components/api/Overview.vue'),
        Param: path.resolve(__dirname, './components/api/Param.vue'),
        Property: path.resolve(__dirname, './components/api/Property.vue'),
        Ref: path.resolve(__dirname, './components/api/Ref.vue'),
        ActionButton: path.resolve(__dirname, './components/common/ActionButton.vue'),
        GraphControls: path.resolve(__dirname, './components/common/GraphControls.vue'),
        LiveExample: path.resolve(__dirname, './components/common/LiveExample.vue'),
        Redirect: path.resolve(__dirname, './components/common/Redirect.vue'),
        Feature: path.resolve(__dirname, './components/home/Feature.vue'),
        Features: path.resolve(__dirname, './components/home/Features.vue'),
        HomeExample: path.resolve(__dirname, './components/home/HomeExample.vue'),
        LiveRunBasic: path.resolve(__dirname, './components/home/LiveRunBasic.vue'),
        LiveRunCustomizable: path.resolve(__dirname, './components/home/LiveRunCustomizable.vue'),
        LiveRunEvent: path.resolve(__dirname, './components/home/LiveRunEvent.vue'),
        LiveRunExecutable: path.resolve(__dirname, './components/home/LiveRunExecutable.vue'),
        LiveRunReactive: path.resolve(__dirname, './components/home/LiveRunReactive.vue'),
        QuickStart: path.resolve(__dirname, './components/home/QuickStart.vue')
      }
    })
  ]
}
