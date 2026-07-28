<script setup>
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import GraphControls from "../common/GraphControls.vue";

const lastTheme = ref('');
const orgPositions = ref({});
const loadedDarkHeroImage = ref(null);
const loadedLightHeroImage = ref(null);
const flowConnectInst = ref();
const toVector = ref();
const func1 = ref();
const func2 = ref();
const parametricPlotter = ref();
const arraySource = ref();
const themeChangeObserver = ref();
const canvasEl = ref();

const init = async () => {
  lastTheme.value = document.querySelector("html").className;
  themeChanged();

  let blob = await (await fetch("images/hero-dark.png")).blob();
  loadedDarkHeroImage.value = URL.createObjectURL(blob);
  blob = await (await fetch("images/hero.png")).blob();
  loadedLightHeroImage.value = URL.createObjectURL(blob);

  await nextTick().catch(() => { });

  flowConnectInst.value = new FlowConnect(canvasEl.value);
  window.flowConnect = flowConnectInst.value;
  const flowConnect = flowConnectInst.value;
  flowConnect.disableScale = true;

  flowConnect.on("dimension-change", (_inst, width, height) => arrange(width, height));

  let flow = flowConnect.createFlow({ name: "Math Plot", rules: {} });

  toVector.value = flow.createNode("common/to-vector", Vector.create(585, 105), {
    name: "Node",
  });
  func1.value = flow.createNode("math/func", Vector.create(295, 54), { name: "Node", expression: "cos(t)" });
  func2.value = flow.createNode("math/func", Vector.create(295, 184.3), {
    name: "Node",
    expression: "sin(t) + 0.2cos(2.8t)",
  });
  parametricPlotter.value = flow.createNode("visual/function-plotter", Vector.create(775, 77.2), {
    width: 250,
    name: "Node",
    plotStyle: { axisColor: "grey" },
  });
  parametricPlotter.value.plotStyle.plotColor = "#fa9868";
  parametricPlotter.value.ui.query("core/display")[0].style.borderColor = "#fff";
  arraySource.value = flow.createNode("common/array-source", Vector.create(12.4, 120.4), {
    name: "Node",
    state: {
      number: true,
      range: true,
      min: -5 * Math.PI,
      max: 5 * Math.PI,
      step: 0.1,
    },
  });

  arraySource.value.outputs[0].connect(func1.value.inputs[0]);
  arraySource.value.outputs[0].connect(func2.value.inputs[0]);
  func1.value.outputs[0].connect(toVector.value.inputs[0]);
  func2.value.outputs[0].connect(toVector.value.inputs[1]);
  toVector.value.outputs[0].connect(parametricPlotter.value.inputs[0]);

  flowConnect.render(flow);

  flow.nodes.forEach((node) => {
    orgPositions.value[node.id] = node.position.clone();
    node.style.color = "#fff";
    node.ui.query("core/label").forEach((label) => (label.style.color = "#fff"));
    node.ui.query("core/input").forEach((input) => (input.style.border = "#fff"));
    node.ui.query("core/toggle").forEach((toggle) => {
      toggle.style.color = "#fff";
      toggle.style.backgroundColor = "#777";
    });
  });
  flow.connectors.forEach((connector) => {
    connector.style.width = 2;
    connector.style.border = false;
    connector.style.color = "#000";
  });

  flowConnect.registerRenderer("background", () => {
    return (context, params, _target) => {
      context.fillStyle = "#292929";
      context.shadowColor = "#000";
      context.shadowOffsetX = 0;
      context.shadowOffsetY = 0;
      context.shadowBlur = 15;
      context.fillRect(params.position.x, params.position.y, params.width, params.height);
    };
  });

  arrange(flowConnect.canvasDimensions.width, flowConnect.canvasDimensions.height);

  themeChangeObserver.value = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes" && mutation.attributeName === "class") {
        themeChanged();
      }
    });
  });

  themeChangeObserver.value.observe(document.querySelector("html"), {
    attributes: true,
  });
}

const arrange = (width, _height) => {
  const flowConnect = flowConnectInst.value;
  let nodes = [[arraySource.value], [func1.value, func2.value], [toVector.value], [parametricPlotter.value]];
  let totalWidth = nodes.reduce((acc, nodeCol) => acc + maxWidth(nodeCol), 0);
  let spacing = (width - 40 - totalWidth) / 3;
  let x = 20;
  if (width > 419) {
    nodes.forEach((nodeCol) => {
      nodeCol.forEach((node) => {
        node.position = node.position.assign(x, orgPositions.value[node.id].y);
      });
      x += maxWidth(nodeCol) + spacing;
    });
  } else {
    Object.values(flowConnect.currFlow.nodes).forEach((node) => {
      node.position = orgPositions.value[node.id].clone();
    });
  }
  let origin = Vector.create(flowConnect.canvasDimensions.width, flowConnect.canvasDimensions.height);
  flowConnect.translateBy(origin.subtract(origin.transform(flowConnect.transform)));
};
const maxWidth = (nodes) => {
  let max = -Infinity;
  nodes.forEach((node) => {
    if (node.width > max) max = node.width;
  });
  return max;
};
const themeChanged = () => {
  const flowConnect = flowConnectInst.value;
  lastTheme.value = document.querySelector("html").className;
  document.querySelector(".vp-home .vp-hero img").src = lastTheme.value.includes("dark")
    ? loadedDarkHeroImage.value || "images/hero-dark.png"
    : loadedLightHeroImage.value || "images/hero.png";

  let titleColor, outlineColor, connectorColor;
  if (lastTheme.value === "dark") {
    titleColor = "#fff";
    outlineColor = "#ccc";
    connectorColor = "#fff";
  } else {
    titleColor = "#000";
    outlineColor = "#000";
    connectorColor = "#000";
  }
  if (flowConnect) {
    flowConnect.currFlow.nodes.forEach((node) => {
      node.style.titleColor = titleColor;
      node.style.outlineColor = outlineColor;
    });
    flowConnect.currFlow.connectors.forEach((connector) => {
      connector.style.color = connectorColor;
    });
  }
};
const handleControl = (controlName) => {
  const flowConnect = flowConnectInst.value;
  if (controlName === "play") {
    if (flowConnect.state === FlowConnectState.Running) flowConnect.currFlow.stop();
    else flowConnect.currFlow.start();
  }
}

onMounted(async () => await init());
onBeforeUnmount(() => themeChangeObserver.value.disconnect());
</script>

<template>
  <div class="home-example-container">
    <GraphControls class="home-example-graph-controls" @control="handleControl" :show-text="false" />
    <canvas ref="canvasEl" class="home-example"></canvas>
  </div>
</template>

<style scoped>
.home-example-container {
  position: absolute;
  top: var(--navbar-height);
  width: calc(100% - 4rem);
  height: calc(var(--navbar-height) * 8.5);
  z-index: -1;
}

.home-example-graph-controls {
  z-index: 1;
  top: 0;
  left: unset;
  right: 0;
  transform: unset;
  border-bottom: unset;
  border-left: unset;
  border-right: unset;
  border-top: unset;
  border-bottom-left-radius: unset;
  border-top-right-radius: unset;
  border-top-left-radius: unset;
  box-shadow: -5px 4px 6px -2px var(--c-block-shadow);
  background-color: #ffffff55;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.home-example-graph-controls div {
  padding-left: 0.7rem;
}

.home-example-graph-controls .graph-control-button:first-child .graph-control-button-text {
  display: none;
}

@media (max-width: 419px) {
  .home-example-container {
    position: relative;
    top: 0;
    width: 100%;
    height: 60vh;
    z-index: 1;
  }

  .home-example {
    box-shadow: 0 0 10px grey;
  }
}
</style>
