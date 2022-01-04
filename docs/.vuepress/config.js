module.exports = {
  // site config
  lang: 'en-US',
  title: 'Flow Connect',
  description: 'A lightweight yet powerful library for creating node-based visual programming interfaces.',
  head: [
    ['link', { rel: 'icon', href: '/images/logo.png' }],
    ['script', { src: '/libs/flow-connect.js' }],
    ['script', { src: '/libs/standard-nodes.js' }],
    ['script', { src: '/example/custom-nodes.js' }]
  ],

  // theme and its config
  theme: '@vuepress/theme-default',
  themeConfig: {
    logo: '/images/logo.png',
    navbar: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Examples', link: '/examples/' },
      {
        text: 'Reference', children: [
          { text: 'Flow Connect', children: [{ text: 'API', link: '/reference/flow-connect/api' }] },
          {
            text: 'Standard Nodes', children: [
              { text: 'Common', link: '/reference/standard-nodes/common' },
              { text: 'Audio', link: '/reference/standard-nodes/audio' },
              { text: 'Math', link: '/reference/standard-nodes/math' },
              { text: 'Net', link: '/reference/standard-nodes/net' },
              { text: 'UI', link: '/reference/standard-nodes/ui' },
              { text: 'Visual', link: '/reference/standard-nodes/visual' }
            ]
          }
        ]
      },
      { text: 'v1.0.1-beta', link: '/' }
    ],
    smoothScroll: true,
    repo: 'saurabh-prosoft/flow-connect',
    lastUpdated: true,
    search: true,
    docsRepo: 'saurabh-prosoft/flow-connect',
    docsDir: 'docs',
    docsBranch: 'master',
    editLinks: true
  },
  plugins: [
    ['@vuepress/search', {
      getExtraFields: (page) => page.frontmatter.tags ?? [],
    }],
    ['@vuepress/medium-zoom', {
      selector: '.zoomable-images img'
    }]
  ]
}
