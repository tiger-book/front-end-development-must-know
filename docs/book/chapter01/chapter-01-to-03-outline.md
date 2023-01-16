# 大纲思考

## 前端框架分析及趋势 

- 前端框架发展简介 5页
    - Web的构成
    - Html历程
    - Css历程
    - JavaScript历程
    - 不得不提的浏览器大战
    - 带来了什么问题
    - 谁做了改进
        - prototype.js
    - jQuery特性
        - 解决了什么问题
    - 那一年，前后端开始分离
    - 第一个挑战来自Angular
    - 它做了什么
    - 怎么伤害的JQuery
    - 它的历程
    - 为什么还不满足，React来了
    - 业务的需要
    - 不得不提的数据驱动，重要的是具体的场景业务需求，需求推动资本，资本推动技术变革
    - 它又干了啥
    - 总有人坐收渔翁之利Vue
    - 又是需求，不是每个项目都是那么复杂
    - 做减法不一定就输
    - 它究竟怎么想的，弯道超车的要领
- Angular从1到2 10页
  - 为什么只说1和2
  - 核心原理1.x
    - 双向绑定
    - 依赖注入
    - 事件机制扩展
    - 脏值检查
    - 一个 1.x简易版
  - 核心原理2.x
    - 加了什么减了什么
    - 脚手架
    - 全面拥抱typescript
    - 组件化
    - 数据流
    - 函数式编程rx.js
  - 2以后是什么
  - 一个简易2.x版本
- React持续成长 10页
  - 初识react
    - 声明式与函数式
    - jsx模版
  - 核心原理
    - 虚拟dom
    - 深度优先遍历算法
  - 数据流
    - flex
    - redux
    - mobx
  - 服务端渲染
  - 版本优化
    - api更新
    - 性能提升
      - 具体细节？
- 后起之秀Vue 10页
  - 初识Vue
    - 发展历程
    - 特点？
  - 核心原理
    - 双向绑定
      - 实现区别
      - 一步步深挖
    - 事件系统
  - 数据流
  - 版本优化
  - 服务端渲染
  - 和React对比
    - 一直模仿

- 框架未来简史 5页
  - web component
  - 为什么组件化成为趋势
    - 移动互联时代
    - 多设备
    - 成本
    - 效率
  - 如何不掉队？
    - 基础和框架区别
    - 快速学习框架的方法
    - 后端思维
      - php?
  - 未来发展方向
    - 我猜的
    - w3c正在推进的？

预估40页

## 前端流程设计 

- 脚手架DIY 15页
  - 脚手架的意义
  - 如何搭建
   - 需要做什么
   - 一步步搭？
   - 如何扩展
  - 一个简易版本
- 规范统一习惯 15页
  - 项目组织结构
    - 目录结构
    - 配置文件
    - README
  - 代码规范
    - 命名规范
    - Html规范
    - Javascript规范
    - CSS规范
  - 统一代码风格
    - 利用Lint工具，配置语法检测规则来对代码风格进行检测。
    - e.g.  js lint, css lint
  - 开发工具规范
    - 编辑器
      - Visual Studio Code 
      - Web Storm
    - 统一插件
      - EditorConfig
      - Lint
      - 单词拼写检查
      - 路径补全
      - 代码自动补全
      - Emmet
      - 代码格式化
- 代码管理的艺术 10页
  - svn与git
   - 优缺点
   - 如何选择
  - git使用
    - git常用命令
    - github流程
    - gitlab流程
    - 哪种好？
    - git图形化工具
      - source tree
      - github desktop
  - 代码提交信息规范
    - [任务名称/编码] [类型] 提交人 : 详细信息。
    - 类型说明
      - 文档
      - 功能
      - 修复
      - 重构
      - 样式
      - 测试
  - 流程化
    - 代码预处理 
      - Lint + Git Hooks
      - Lint + Webhook
    - 人工检查代码 
      - Code Review
      - Pull Request
- 测试不可或缺 10页
  - TDD？
  - 测试工具
  - 单元测试先行
  - 项目中如何使用
  - 逃避测试的后果
  - 一个简易版本
- 无文档不开心 10页
  - 文档的意义
    - 文档是一直要更新维护的？
    - 统一文档规范
  - 怎么写文档
    - 时间
    - 结构
    - 重要性
  - 一个简易例子
    - README搭建指南
      - 运行环境
      - 依赖项
      - 项目安装指南
      - 项目结构图
      - 参考资料
      - 维护人员联系方式

- 预估60页

## CSS那些不得不说的事

- 寻找CSS设计的圣杯 10页
  - css是web皮肤？
  - css 盒模型
  - 浏览器区别
  - css进化3.0
  - css分类理论
- 预处理实现自动适配 10页
  - 为什么预处理？
  - 方案推荐
- 可行的CSS方案 10页
 - 一个简易版本

预估30页