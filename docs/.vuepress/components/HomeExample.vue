<template>
  <div class="home-example-container">
    <canvas ref="home-example"></canvas>
  </div>
</template>

<script>
export default {
  name: "HomeExample",
  mounted() {
    this.lastTheme = document.querySelector("html").className;
    this.themeChanged();

    fetch("/images/hero-dark.png")
      .then((res) => res.blob())
      .then((blob) => (this.loadedDarkHeroImage = URL.createObjectURL(blob)));
    fetch("/images/hero.png")
      .then((res) => res.blob())
      .then((blob) => (this.loadedLightHeroImage = URL.createObjectURL(blob)));

    this.flowConnect = new FlowConnect(this.$refs["home-example"]);
    window.flowConnect = this.flowConnect;
    this.flowConnect.disableScale = true;

    this.flowConnect.on("dimension-change", (_inst, width, height) =>
      this.arrange(width, height)
    );

    let flow = this.flowConnect.createFlow({ name: "Math Plot" });

    this.toVector2 = new StandardNodes.Common.ToVector2(flow, {
      position: new Vector2(585, 105),
    });
    this.func1 = new StandardNodes.Math.Function(
      flow,
      { position: new Vector2(295, 54) },
      "cos(t)"
    );
    this.func2 = new StandardNodes.Math.Function(
      flow,
      { position: new Vector2(295, 184.3) },
      "sin(t) + 0.2cos(2.8t)"
    );
    this.parametricPlotter = new StandardNodes.Visual.FunctionPlotter(
      flow,
      250,
      {},
      { position: new Vector2(775, 77.2) }
    );
    this.arraySource = new StandardNodes.Common.ArraySource(flow, {
      state: {
        number: true,
        range: true,
        min: -5 * Math.PI,
        max: 5 * Math.PI,
        step: 0.1,
      },
      position: new Vector2(12.4, 120.4),
    });

    this.arraySource.outputs[0].connect(this.func1.inputs[0]);
    this.arraySource.outputs[0].connect(this.func2.inputs[0]);
    this.func1.outputs[0].connect(this.toVector2.inputs[0]);
    this.func2.outputs[0].connect(this.toVector2.inputs[1]);
    this.toVector2.outputs[0].connect(this.parametricPlotter.inputs[0]);

    this.flowConnect.render(flow);

    this.flowConnect.currFlow.nodes.forEach(
      (node) => (this.orgPositions[node.id] = node.position.clone())
    );

    this.arrange(
      this.flowConnect.canvasDimensions.width,
      this.flowConnect.canvasDimensions.height
    );

    this.themeChangeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          this.themeChanged();
        }
      });
    });

    this.themeChangeObserver.observe(document.querySelector("html"), {
      attributes: true,
    });
  },
  beforeUnmount() {
    this.themeChangeObserver.disconnect();
  },
  data() {
    return {
      orgPositions: {},
      lastTheme: "",
      loadedDarkHeroImage: null,
      loadedLightHeroImage: null,
    };
  },
  methods: {
    arrange(width, height) {
      let nodes = [
        [this.arraySource],
        [this.func1, this.func2],
        [this.toVector2],
        [this.parametricPlotter],
      ];
      let totalWidth = nodes.reduce(
        (acc, nodeCol) => acc + this.maxWidth(nodeCol),
        0
      );
      let spacing = (width - 40 - totalWidth) / 3;
      let x = 20;
      if (width > 419) {
        nodes.forEach((nodeCol) => {
          nodeCol.forEach((node) => {
            node.position = node.position.assign(
              x,
              this.orgPositions[node.id].y
            );
          });
          x += this.maxWidth(nodeCol) + spacing;
        });
      } else {
        Object.values(this.flowConnect.currFlow.nodes).forEach((node) => {
          node.position = this.orgPositions[node.id].clone();
        });
      }
      let origin = new Vector2(
        this.flowConnect.canvasDimensions.width,
        this.flowConnect.canvasDimensions.height
      );
      this.flowConnect.translateBy(
        origin.subtract(origin.transform(this.flowConnect.transform))
      );
    },
    maxWidth(nodes) {
      let max = -Infinity;
      nodes.forEach((node) => {
        if (node.width > max) max = node.width;
      });
      return max;
    },
    themeChanged() {
      this.lastTheme = document.querySelector("html").className;
      document.querySelector(".home .hero img").src = this.lastTheme.includes(
        "dark"
      )
        ? this.loadedDarkHeroImage || "/images/hero-dark.png"
        : this.loadedLightHeroImage || "/images/hero.png";
    },
  },
};
</script>

<style scoped>
.home-example-container {
  position: absolute;
  top: var(--navbar-height);
  width: calc(100% - 4rem);
  height: calc(var(--navbar-height) * 8.5);
  z-index: -1;
}
@media (max-width: 419px) {
  .home-example-container {
    position: relative;
    top: 0;
    width: 100%;
    height: 50vh;
    z-index: 1;
  }
}
</style>
