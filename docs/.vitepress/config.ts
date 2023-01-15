import { defineConfig } from 'vitepress'
import { version } from '../../package.json'

export default defineConfig({
  title: '前端开发必知必会',
  description: '前端开发必知必会',
  base:
    process.env.PULISH_ENV === 'production'
      ? '/'
      : '/front-end-development-must-know',
  lang: 'en-US',
  head: [['link', { rel: 'icon', href: 'favicon.ico' }]],
  markdown: {
    lineNumbers: true,
  },
  lastUpdated: true,
  appearance: true,
  themeConfig: {
    siteTitle: '前端开发必知必会',
    logo: '/favicon.ico',
    lastUpdatedText: '最后更新时间',
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2022-09-tiger',
    },
    // docFooter: {
    //   prev: '上一页',
    //   next: '下一页'
    // },
    nav: nav(),
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/GA23187/vitepress-demo',
      },
    ],
    sidebar: {
      '/book/': [
        {
          text: 'chapter01',
          items: [
            {
              text: '大纲思考',
              link: '/book/chapter01/chapter-01-to-03-outline',
            },
            {
              text: '前端开发核心及 Deno Web 实战',
              link: '/book/chapter01/chapter-01-front-intro',
            },
          ],
        },
        {
          text: 'chapter02',
          items: [
            {
              text: '前端工程化核心',
              link: '/book/chapter02/chapter-02-project-core',
            },
          ],
        },
        {
          text: 'chapter03',
          items: [
            {
              text: '前端必会的构建工具实战',
              link: '/book/chapter03/chapter-03-build',
            },
          ],
        },
        {
          text: 'chapter04',
          items: [
            {
              text: '前端核心模块的设计与实现',
              link: '/book/chapter04/04-arc-core',
            },
          ],
        },
        {
          text: 'chapter05',
          items: [
            { text: '性能优化指南', link: '/book/chapter05/05-perfermance' },
          ],
        },
        {
          text: 'chapter06',
          items: [
            {
              text: '从 0 开发微前端和 WebAssembly',
              link: '/book/chapter06/06-expaction',
            },
          ],
        },
      ],
    },
  },
})

function nav() {
  return [
    {
      text: '关于',
      link: '/about/',
      activeMatch: '/about/',
    },
    {
      text: '相关文档',
      items: [
        {
          text: 'vite',
          link: 'https://cn.vitejs.dev/',
        },
        {
          text: 'vitepress中文版(大佬翻译)',
          link: 'https://process1024.github.io/vitepress/',
        },
      ],
    },
  ]
}
