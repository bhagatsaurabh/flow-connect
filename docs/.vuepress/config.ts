import { defineUserConfig, SiteData } from "vuepress";
import { path } from "vuepress/utils";
import { viteBundler } from "@vuepress/bundler-vite";
import { defaultTheme } from "@vuepress/theme-default";
import markdownItAttrs from "markdown-it-attrs";
import { searchPlugin } from "@vuepress/plugin-search";
import { mediumZoomPlugin } from "@vuepress/plugin-medium-zoom";
import { registerComponentsPlugin } from "@vuepress/plugin-register-components";
import { markdownTabPlugin } from "@vuepress/plugin-markdown-tab";

import { themeOptions } from "./theme.config";

let base: SiteData["base"] = "/";
if (process.env.DOCS_CONTEXT === "GitHub") {
  base = "/flow-connect/";
}
console.log("Base URL:", base);

export default defineUserConfig({
  bundler: viteBundler(),
  theme: defaultTheme(themeOptions),

  // site config
  lang: "en-US",
  title: "Flow Connect",
  description: "A lightweight yet powerful library for creating node-based visual programming interfaces.",
  base,
  head: [
    ["base", { href: base }],
    ["link", { rel: "icon", href: "images/logo.png" }],
    [
      "script",
      {},
      `
      function loadPackages() {
        const packages = [
          'https://cdn.jsdelivr.net/npm/@flow-connect/common@latest/dist/common.js',
          'https://cdn.jsdelivr.net/npm/@flow-connect/common@latest/dist/common.js.map',
          'https://cdn.jsdelivr.net/npm/@flow-connect/visual@latest/dist/visual.js',
          'https://cdn.jsdelivr.net/npm/@flow-connect/visual@latest/dist/visual.js.map',
          'https://cdn.jsdelivr.net/npm/@flow-connect/ui@latest/dist/ui.js',
          'https://cdn.jsdelivr.net/npm/@flow-connect/ui@latest/dist/ui.js.map',
          'https://cdn.jsdelivr.net/npm/@flow-connect/net@latest/dist/net.js',
          'https://cdn.jsdelivr.net/npm/@flow-connect/net@latest/dist/net.js.map',
          'https://cdn.jsdelivr.net/npm/@flow-connect/math@latest/dist/math.js',
          'https://cdn.jsdelivr.net/npm/@flow-connect/math@latest/dist/math.js.map',
          'https://cdn.jsdelivr.net/npm/@flow-connect/audio@latest/dist/audio.js',
          'https://cdn.jsdelivr.net/npm/@flow-connect/audio@latest/dist/audio.js.map',
          'example/custom-nodes.js'
        ];
        packages.forEach(package => {
          const script = document.createElement('script');
          script.src = package;
          if (package.slice(-3) === 'map') script.type = 'application/json';
          document.head.append(script);
        });
      };
      `,
    ],
    [
      "script",
      { src: "https://cdn.jsdelivr.net/npm/flow-connect@latest/dist/flow-connect.js", onload: "loadPackages()" },
    ],
    [
      "script",
      { src: "https://cdn.jsdelivr.net/npm/flow-connect@latest/dist/flow-connect.js.map", type: "application/json" },
    ],
    // ['script', { src: 'example/custom-nodes.js' }]
  ],
  extendsMarkdown: (md) => {
    md.use(markdownItAttrs);
  },
  plugins: [
    markdownTabPlugin({
      codeTabs: true,
      tabs: true,
    }),
    searchPlugin({
      getExtraFields: (page) => (page.frontmatter.tags as string[]) ?? [],
    }),
    mediumZoomPlugin({
      selector: "img.zoomable",
    }),
    registerComponentsPlugin({
      components: {
        Enum: path.resolve(__dirname, "./components/api/Enum.vue"),
        Event: path.resolve(__dirname, "./components/api/Event.vue"),
        Function: path.resolve(__dirname, "./components/api/Function.vue"),
        Hierarchy: path.resolve(__dirname, "./components/api/Hierarchy.vue"),
        Icon: path.resolve(__dirname, "./components/api/Icon.vue"),
        Method: path.resolve(__dirname, "./components/api/Method.vue"),
        Optional: path.resolve(__dirname, "./components/api/Optional.vue"),
        Overview: path.resolve(__dirname, "./components/api/Overview.vue"),
        Param: path.resolve(__dirname, "./components/api/Param.vue"),
        Property: path.resolve(__dirname, "./components/api/Property.vue"),
        Ref: path.resolve(__dirname, "./components/api/Ref.vue"),
        ActionButton: path.resolve(__dirname, "./components/common/ActionButton.vue"),
        GraphControls: path.resolve(__dirname, "./components/common/GraphControls.vue"),
        LiveExample: path.resolve(__dirname, "./components/common/LiveExample.vue"),
        Redirect: path.resolve(__dirname, "./components/common/Redirect.vue"),
        Feature: path.resolve(__dirname, "./components/home/Feature.vue"),
        Features: path.resolve(__dirname, "./components/home/Features.vue"),
        HomeExample: path.resolve(__dirname, "./components/home/HomeExample.vue"),
        LiveRunBasic: path.resolve(__dirname, "./components/home/LiveRunBasic.vue"),
        LiveRunCustomizable: path.resolve(__dirname, "./components/home/LiveRunCustomizable.vue"),
        LiveRunEvent: path.resolve(__dirname, "./components/home/LiveRunEvent.vue"),
        LiveRunExecutable: path.resolve(__dirname, "./components/home/LiveRunExecutable.vue"),
        LiveRunReactive: path.resolve(__dirname, "./components/home/LiveRunReactive.vue"),
        QuickStart: path.resolve(__dirname, "./components/home/QuickStart.vue"),
      },
    }),
  ],
});
