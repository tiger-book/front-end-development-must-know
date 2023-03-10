# 第 1 章 前端开发核心及 Deno Web 实战

在前端开发中，经常要和 package.json 文件、Babel 和 ES 规范打交道，本章详细介绍这三部分的内容。另外，Deno 给 Web 开发提供了新的开发方式，因此本章还会介绍 Deno 的基础模块、依赖模块、HTTP 模块和 Web 开发。

本章主要内容如下：

1. 前端中的“大管家”package.json 文件。

2. 前端中的编译原理 Babel7。

3. 前端面试必知的 ES 语法规范。

4. Deno Web 实践。

## 1.1 前端中的“大管家”package.json 文件

每个前端项目中都有 package.json 文件，在 Web 工程中，最常见的配置有配置项目启动、打包命令和声明依赖的 npm 包。如果打开一个 npm 包的 package.json 文件，则很可能会发现，它比常见的 Web 工程的配置要多一些。下面以vue@2.6.12版本为例，看一下它的 package.json 中都包含了哪些配置。

```json
{
  "name": "vue",
  "version": "2.6.12",
  "description": "",
  "main": "dist/vue.runtime.common.js",
  "module": "dist/vue.runtime.esm.js",
  "unpkg": "dist/vue.js",
  "jsdelivr": "dist/vue.js",
  "typings": "types/index.d.ts",
  "files": [],
  "sideEffects": false,
  "scripts": {},
  "gitHooks": {},
  "lint-staged": {},
  "repository": {},
  "keywords": [],
  "author": "Evan You",
  "license": "MIT",
  "bugs": {},
  "homepage": "https://github.com/vuejs/vue#readme",
  "devDependencies": {},
  "config": {
    "commitizen": {
      "path": ""
    }
  }
}
```

package.json 文件作为 Web 工程的入口到底有多少配置是和我们的日常相关的？哪些配置是和 npm 包相关的？又有哪些配置和其他第三方工具有交集？怎么和三方工具配合能给日常开发提供便利？下面我们一点一点来剖析这个文件。

首先使用 npm 命令或者 yarn 命令生成一个最简单的 package.json 文件，注意，笔者的 npm 版本为 6.12.0。

```shell
yarn init -y
```

```json
{
  "name": "package-json-intro",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "description": ""
}
```

这是一个 JSON 对象，每一项都是该项目的配置。各项配置的含义如下。

- name：项目名称，必需字段。
- version：项目版本，必需字段。
- main：入口文件。
- license: 项目遵守的许可证。
- scripts： 可运行的 npm 命令。
- keywords：关键词。
- author：作者。
- description：项目描述。

package.json 文件中有两个比较特殊的字段，即 name 和 version，它们是必需字段。下面对这两个字段进行详细说明。

（1）name 字段：

- 长度必须小于或等于 214 个字符，不能以“.”或者`_`开头，不能包含大写字母。

- 名字可以作为参数被传入 `require("")`，用来导入模块，所以尽量语义化。

- 字段不能与其他模块名重复，可以使用`npm view <packageName>`查询是否重复。如果不重复，就提示 404，如果 1-1 所示。

  ![](./images/pj-1.png)

图 1-1

如果 npm 包上有对应的包，则会显示包的详细信息，如图 1-2 所示。

![](./images/pj-2.png)

图 1-2

（2）version 字段：

- 遵守语义化版本 2.0.0（ SemVer）规范。格式为： **主版本号.次版本号.修订号**。主版本号表示做了不兼容的 API 修改，次版本号表示做了向下兼容的功能性新增，修订号表示做了向下兼容的 bug 修复。
- 如果某个版本的改动比较大、并且不稳定，可能无法满足预期的兼容性需求时，就需要发布先行版本。
- 先行版本号可以加到**主版本号.次版本号.修订号**的后面，通过 - 号连接以点分隔的标识符和版本编译信息：内部版本（alpha）、公测版本（beta）和候选版本 rc（即 release candiate），图 1-3 所示的 vue 发布的版本号。

![](./images/pj-3.png)

图 1-3

- 查看 npm 包的版本信息，以 vue 包为例。

  查看最新版本：npm view vue version。

  查看所有版本：npm view vue versions。

keywords： 包关键字，会对包中的 `description` 字段和 `keywords` 字段进行匹配，写好 `package.json`中的 `description` 和 `keywords` 将有利于增加包的曝光率。

依赖包：npm 包的声明会添加到 dependencies 或者 devDependencies 中，dependencies 中的包指定了项目在生产运行所必需的包。devDependencies 中声明的是开发阶段需要的包，如 Webpack、eslint、babel 等，用来辅助开发，打包上线时并不需要这些包。所以大家要根据包的实际用处声明到适当的位置。

若希望在包找不到或者安装失败时，npm 能继续运行，可将该包放在 optionalDependencies 对象中。optionalDependencies 会覆盖 dependencies 中同名的包，这点需要特别注意。

scripts 脚本：

package.json 内置脚本入口，是 stage-value 键值对配置，key 为可运行的命令，通过`npm run <stage>`执行命令。除了运行基本的 scripts 命令，还可以结合 pre 和 post 完成前置、后续操作，该操作可以类比单元测试用的 setUp 和 tearDown。

先看一组 scripts：

```javascript
"scripts": {
    "dev": "node index.js",
    "predev": "node beforeIndex.js",
    "postdev": "node afterIndex.js"
 },
```

这三个文件中都只有一句 console 语句：

```javascript
//index.js
console.log('scripts : index.js')

//beforeIndex.js
console.log('scripts: before index.js ')

//afterIndex.js
console.log('scripts: after index.js ')
```

现在我们只执行 npm run dev 命令，看一下效果：

```shell
$ node beforeIndex.js
scripts: before index.js
$ node index.js
scripts : index.js
$ node afterIndex.js
scripts: after index.js
```

这三个 script 都执行了，执行的顺序是 `predev-> dev -> postdev`。如果 scripts 命令存在一定的先后关系，则采取这种 pre&post scripts 不失为一种好的方案。

files 配置：files 是一个数组配置，用来描述作为依赖包安装时需要说明的入口文件列表。当 npm 包发布（release）时，files 指定哪些文件会被推送到 npm 服务器，如果指定的是文件夹，那么该文件夹下面的所有的文件都会被提交。

如果有文件不想提交，则可以在.npmignore 中说明。首先看一下 vue 包中的配置，如图 1-4 所示

```json
"files": [
    "src",
    "dist/*.js",
    "types/*.d.ts"
 ],
```

![123](./images/pj-4.png)

图 1-4

入口文件 main：

用来指定加载的入口文件，在 browser 和 node 环境中均可使用。如果项目发布成了 npm 包，则用户安装并且使用 require('my-module')后返回的就是 main 字段中所列出文件的 module.exports 属性。如果不指定该字段，则 node 会尝试加载根目录的 index.js、index.json 或 index.node，如果都没有找到，就会报错，只能通过 require('my-module/dist/xxx.js')这种方式加载。

module 配置：

定义 npm 包的 ESM 规范的入口文件，在 browser 环境和 node 环境中均可使用。

browser 配置：

npm 包在 browser 环境下的入口文件。

不知道读者有没有发现，main、module、browser 这三项配置都是和入口文件相关，

注意：main、module 和 browser 这三项配置都和入口文件相关。之所以把它们放在一起介绍，是因为这几项之间是有差别的，特别是在不同的使用场景下。在 Web 环境下，如果使用 loader 加载 ESM（ES module），那么这三项配置的加载顺序是 browser > module > main；如果使用 require 加载 CommonJS 模块，则加载的顺序没有变化。

Webpack 在进行项目构建时，有一个 target 选项，默认为 Web，即构建 Web 应用。如果需要编译一些同构项目，如 node 项目，则只需将 webpack.config.js 的 target 选项设置为 node 进行构建即可。

如果是在 node 环境中加载 CommonJS 模块或者 ESM，则只有 main 字段有效。

engines 配置：

日常在维护一些遗留项目时，对 npm 包的版本或者 node 的版本可能会有特殊的要求。如果不满足条件，则可能会出现各式各样奇怪的问题。为了让项目能开箱即用，可以在 engines 中说明具体的版本号。

```json
"engines": {
    "node": ">=8.10.3 <12.13.0",
    "npm": ">= 6.9.0"
 }
```

需要注意的是，engines 属性仅起到说明的作用，即使用户安装的版本不符合，也不影响依赖包的安装。

bin 配置：

许多包都有一个或多个可执行文件，可以使用`npm link`命令把这些文件导入全局路径中，以便在任意目录下执行。如导入脚手架工具 create-react-app 的 react-scripts 中，

```js
"bin": {
    "react-scripts": "./bin/react-scripts.js"
 }
```

或是 vue-cli 脚手架的@vue 包中。

```
"bin": {
    "vue": "bin/vue.js"
},
```

上面的两个配置在 package.json 中提供了一个映射到本地本地文件名的 bin 字段，之后 npm 将链接这个文件到 prefix/bin 里面，以便全局引入，或者链接到本地的`./node_modules/.bin/`目录中，以便在本项目中使用。

config 配置：

该对象字段用来配置 scripts 运行的配置参数，如下所示。

```js
{
  "name": "package-json-intro",
  "scripts": {
    "dev": "node server.js"
  },
  "config": {
    "port": 9002
  }
}
```

如果运行 yarn run start ，则该 port 字段会映射到 npm package config_port 环境变量:

```js
const http = require('http')
console.log(process.env.npm_package_config_port)
http
  .createServer(function (req, res) {
    res.end('Hello World\n')
  })
  .listen(process.env.npm_package_config_port)
```

如果像改其他端口一样，则可以使用：

```shell
npm config set foo:port 80
```

author、license、repository、homepage、bugs 配置。

author：指明作者。

license：该包或者工程需要遵守的协议。

repository：是一个对象配置，type 说明是 Git 库还是 svn 库，URL 说明该包或者工程源代码地址。

bugs：指明该包或者工程的 bug 地址或者反馈问题的 email，可以指定一个或者两个，便于 author 快速搜集、处理问题。

```json
{
  "url": "https://github.com/owner/project/issues",
  "email": "project@hostname.com"
}
```

os 配置和 CPU 配置

os: 如果我们开发的 npm 包只希望运行在 darwin 系统下，则为避免发生不必要的异常，建议 Windows 用户不要安装，这时候 os 配置就可以帮我们实现这样的效果。

```json
"os" : [ "darwin", "linux" ] #适用的系统
"os" : [ "!win32" ]          #黑名单系统
```

cup：该配置和 os 的配置类似，用 cpu 字段可以更精准地限制用户的安装环境。

```json
"cpu" : [ "x64", "AMD64" ] # 适用用
"cpu" : [ "!arm", "!mips" ] # 黑名单
```

publicConfig 配置：

一组配置值，在发布时使用。比如使用 registry 指定发布的地址来发布指定的 tag，access（public，restricted）等配置。

以上咱们介绍的都是 package.json 的标准配置。但是在开发过程中，项目很可能涉及很多的第三方包，如 eslint、typings、Webpack 等，这些包怎样和 package.json 配合使用的，下面看下常见的几个配置。

unpkg 配置：

npm 上所有的文件都开启了 CDN 服务，该 CDN 服务由 unpkg 提供。

```json
"unpkg": "dist/vue.js",
```

默认访问文件`https://unpkg.com/vue@2.6.12/dist/vue.js`。

jsdelivr 配置：jsdelivr 免费 CDN 服务配置。

sideEffects 配置：

该项为 Webpack 的辅助配置，是 v4 开始新增了一个特性，声明该包或模块是否包含 sideEffects（副作用）。原理是 Webpack 能将标记为 side-effects-free 的包由 import {a} from xx 转换为 import {a} from 'xx/a'，从而自动去掉不必要的模块。如果我们引入的 包或模块标记了 sideEffects: false，那么不管它是否真的有副作用，只要没有被用到，整个包或模块就会被完整地移除。

typings 配置：

ts 的入口文件，作用与 main 配置相同。

lint-staged 配置：

lint-staged 是一个在 Git 暂存文件上运行 linters 的工具，配置后每次修改一个文件即可给所有文件执行一次 lint 检查，通常配合 githooks 一起使用，配置检查工具。

```json
"lint-staged": {
    "*.js": [
      "eslint --fix",
      "git add"
    ]
 }
```

gitHooks 配置：

定义一个钩子，在提交（commit）之前执行 eslint 检查。当执行 lint 命令后，会自动修复暂存区的文件。修复之后的文件并不存储在暂存区中，所以需要用 git add 命令将修复后的文件重新加入暂存区。在执行完 pre-commit 命令后，如果没有错误，就会执行 git commit 命令。

```json
"gitHooks": {
    "pre-commit": "lint-staged",
}
```

standard 配置：

standard 是一个 js 代码检查和优化的工具库，也可以在 package.json 中增加相应的配置来优化代码。

```json
{
  "standard": {
    "parser": "babel-eslint",
    "ignore": ["**/out/", "/lib/xx/", "/lib2/xx/"]
  }
}
```

browserlist 配置：设置浏览器的兼容情况

babel 配置：这里是指 babel 编译配置，代码如下。

```json
"babel": {
    "presets": ["@babel/preset-env"],
    "plugins": [...]
}
```

## 1.2 前端中的编译原理 Babel7

Babel 是前端开发中最常见的第三方工具，它的功能有三个。一是转义 ECMAScript2015+语法的代码，保证比较新的语法也可以在旧版本的浏览器中运行；二是可以通过 Polyfill 方式在目标环境中添加缺失的特性；三是源码转换功能。

本节详细介绍 Babel 的配置和用法，并介绍每项配置引入的原因，搞清楚@babel/runtime，`@babel/polyfill和@babel/plugin-transform-runtime`这些库到底是用来做什么的，介绍 preset 和 plugin 配置有什么作用。

下面通过一个简单的 compare 函数看看转换结果，如 1-5 所示。

![123](./images/babel-1.png)

图 1-5

我们输入的是最基本的箭头函数，经过 Babel 的转换后，转换成了基本的 function。就是这么简单，它不会运行我们的代码，也不会去打包我们的代码。

首先，搭建一个本地环境，先建立根目录并生成 package.json 文件。

```shell
~ mkdir babel-intro && cd babel-intro
~ npm init -y
```

先安装@babel/core 和@babel/cli 包，core 是 babel 核心包，@babel/cli 包和@babel/polyfill 包都要在核心包上才能正常工作。@babel/cli 是 Babel 提供的命令行工具，主要是提供 Babel 命令。

```shell
npm install --save-dev @babel/core @babel/cli
```

其次，安装@babel/preset-env 和@babel/polyfill。@babel/preset-env 会根据配置的目标环境生成插件列表来并进行编译。目标环境可以在 package.json 的 browserslist 中进行配置。Babel 默认只转换新的 JavaScript 语法，但是不转换新的 API，比如 Iterator、Generator、Set、Maps、Proxy、Reflect、Symbol 和 Promise 等全局对象，以及一些定义在 Object 对象上的方法（比如 Object.assign）都不会转换。如果还想正常执行，就需要使用 polyfill 了。

```shell
npm install --save-dev @babel/preset-env @babel/polyfill
```

再次，在 package.json 统计目录下新建一个配置文件，Babel 中的配置文件有以下四种。

第一种是 babel.config.js，配置内容大致如下：

```js
module.exports = function (api) {
  api.cache(true);

  const presets = [ ... ];
  const plugins = [ ... ];

  return {
    presets,
    plugins
  };
}
```

第二种是.babelrc，配置文件内容为 JSON 数据结构。

```json
{
  "presets": [...],
  "plugins": [...]
}
```

第三种是在 package.json 中配置 babel 字段，该配置我们在 1.1 节已经介绍过。

```json
{
  "name": "babel-intro",
  "version": "1.0.0",
  "babel": {
    "presets": [ ... ],
    "plugins": [ ... ],
  }
}
```

最后一种是.babelrc.js，配置与.babelrc 相同，但是需要使用 JavaScript 实现。

```js
const presets = [ ... ];
const plugins = [ ... ];

module.exports = { presets, plugins };
```

在这四种添加配置文件的方式中，最常用的是 babel.config.js 和.babelrc，Babel 官方推荐 babel.config.js 配置。因为该配置是项目级别的配置，会影响整个项目中的代码，包括 node_modules。有了 babel.config.js 之后，就不会去执行.babelrc 的配置。.babelrc 只影响本项目中的代码。

本节采用 babel.config.js 配置。

```js
module.exports = function (api) {
  api.cache(true)
  const presets = ['@babel/preset-env']
  const plugins = []
  return { presets, plugins }
}
```

接下来在 src 目录下新建一个文件，并输入基本的测试代码，箭头函数：

```js
let compare = (a, b) => {
  return a > b
}
```

在 package.json 中配置 scripts 脚本。

```
"build": "babel src --out-dir lib"
```

使用@babel/cli 提供的 babel 命令，编译 src 目录下的 JavaScript 文件，将编译后的文件输出到 lib 目录下，如图 1-6 所示。

```shell
npm run build
```

![123](./images/babel-2.png)

图 1-6

Babel 的工作过程。

Babel 与大多数的编译器一样，它的工作过程可分成三部分：

- 解析（Parse）：将源代码转换成抽象语法树（Abstract Syntax Tree，AST），抽象语法树是源代码的抽象语法结构的树状表示形式，树上的每个节点都表示源代码中的一种结构。
- 转换（transfrom）：对抽象语法树做一些特殊处理，使其符合编译器的期望。在 Babel 中主要使用转换插件来实现。
- 代码生成（generate）：将转换过的（抽象语法树）生成新的代码。

下面通过一个简单的例子说明一下 Babel 的工作工程。

```js
let { parse } = require('@babel/parser')
let { default: generate } = require('@babel/generator')

let code = 'let compare=(a,b)=> a > b'

let ast = parse(code, {
  sourceType: 'module',
})
```

解析过程可分为两个部分：词法分析和语法分析。

词法分析：

词法分析：编译器读取代码之后，按照预定的规则把分词后的内容合并成一个个标识（tokens）。同时，移除空白符、注释等。最后，整个代码被分割进一个 tokens 列表。例如，compare 函数被分割的 token 列表如下：

```js
;[
  { type: 'Keyword', value: 'const' },
  { type: 'Identifier', value: 'compare' },
  { type: 'Punctuator', value: '=' },
  { type: 'Punctuator', value: '(' },
  { type: 'Identifier', value: 'a' },
  { type: 'Punctuator', value: ',' },
  { type: 'Identifier', value: 'b' },
  { type: 'Punctuator', value: ')' },
  { type: 'Punctuator', value: '=>' },
  { type: 'Identifier', value: 'a' },
  { type: 'Punctuator', value: '>' },
  { type: 'Identifier', value: 'b' },
]
```

语法分析：也叫解析器。它会将词法分析出来的数组转化成树形的表达形式，同时验证语法。如果语法有错，就抛出语法错误。

```json
{
  "type": "Program",
  "start": 0,
  "end": 25,
  "body": [
    {
      "type": "VariableDeclaration",
      "start": 0,
      "end": 24,
      "declarations": [
        {
          "type": "VariableDeclarator",
          "start": 4,
          "end": 24,
          "id": {
            "type": "Identifier",
            "start": 4,
            "end": 11,
            "name": "compare"
          },
          "init": {
            "type": "ArrowFunctionExpression",
            "start": 13,
            "end": 24,
            "id": null,
            "expression": true,
            "generator": false,
            "async": false,
            "params": [
              {
                "type": "Identifier",
                "start": 14,
                "end": 15,
                "name": "a"
              },
              {
                "type": "Identifier",
                "start": 16,
                "end": 17,
                "name": "b"
              }
            ],
            "body": {
              "type": "BinaryExpression",
              "start": 21,
              "end": 24,
              "left": {
                "type": "Identifier",
                "start": 21,
                "end": 22,
                "name": "a"
              },
              "operator": ">",
              "right": {
                "type": "Identifier",
                "start": 23,
                "end": 24,
                "name": "b"
              }
            }
          }
        }
      ],
      "kind": "let"
    }
  ],
  "sourceType": "module"
}
```

这里，我们需要解释一下抽象语法树中的关键字段，根节点"type": "VariableDeclaration"表示变量声明，"declarations": [ ]表示具体的声明，kind 表示声明的变量类型。

接着看 declarations 内部声明了一个变量，并且知道了它的内部属性（id、init、start、end），然后再以此访问每一个属性及它们的子节点。id 是 Idenrifier 的简写，name 属性表示变量名。

```json
{
  "type": "Identifier",
  "name": "add"
}
```

以上结构表示一个标识符。

接着看之后是 init 部分，init 由好几个内部属性组成：

- type 是`ArrowFunctionExpression`，表示这是一个箭头函数。
- `params` 是这个箭头函数的入参，其中每一个参数都是一个 `Identifier` 类型的节点。
- `body` 是这个箭头函数的主体，type 是 BlockStatement，表示这是一个块级声明 BlockStatement。
- 内层的 body 的 type 为一个 BinaryExpression 二项式：left、operator、right，分别表示二项式的左边变量、运算符以及右边变量。

下面进行语法转换，前面我们介绍过，Babel 的语法转换是通过插件完成的。没有插件，抽象语法树经过生成器生成的代码和源代码一摸一样。Babel 默认提供了许多插件，让我们方便地对抽象语法树进行操作。下面介绍两个比较重要的插件，同时用这两个插件实现一个简单的操作抽象语法树的过程。

```js
let types = require('@babel/types')
```

第一个是@babel/types，它的作用是创建、修改、删除、查找抽象语法树的节点。抽象语法树的节点可分为多种类型，比如，ExpressionStatement（表达式）、ClassDeclaration（类声明）和 VariableDeclaration（变量声明）等。同样的，这些类型都有对应的创建方法：t.expressionStatement、t.classDeclaration、t.variableDeclaration。types 也提供了对应的判断方法：t.isExpressionStatement、t.isClassDeclaration、t.isVariableDeclaration。

不过，这些插件需要和 traverse 遍历插件一起使用，因为 types 只能对单一节点进行操作。下面要介绍的插件是@babel/traverse。

```js
let traverse = require('@babel/traverse').default
```

这个插件可对抽象语法树的所有节点进行遍历，并使用指定 Visitor 来处理相关的节点。

继续按本节最初的例子补充转换过程。

```js
let { parse } = require('@babel/parser')
let traverse = require('@babel/traverse').default
let types = require('@babel/types')
let generate = require('@babel/generator').default

let code = 'let compare=(a,b)=> a > b'

let ast = parse(code, {
  sourceType: 'module',
})

traverse(ast, {
  ArrowFunctionExpression: (path, state) => {
    let node = path.node
    let id = path.parent.id
    let params = node.params
    let body = types.blockStatement([types.returnStatement(node.body)])
    let functionExpression = types.functionExpression(
      id,
      params,
      body,
      false,
      false
    )
    path.replaceWith(functionExpression)
  },
})

let targetCode = generate(ast)
```

当有一个 Identifier(ArrowFunctionExpression) 成员方法的 Visitor 时，访问的就是路径而非节点。所以需要通过 path.node 找到对应的节点。通过 node.params 获得方法的参数。使用 types.blockStatement 创建“{ }”的结构，使用 types.returnStatement(node.body)返回'return a > b'这样的结构。使用 types.functionExpression(id,params,body,false,false)创建一个如下面所示的结构。

```js
function(a,b){
  return a > b
}
```

至此，就完成了新结构的创建。接下来，把原来的节点替换成新生成的节点。

```js
path.replaceWith(functionExpression)
```

下一步就是进入到编译的最后一步，代码生成。

经过代码转换之后，抽象语法树已经变成期望的结构，现在需要用@babel/generator 插件做代码合成，生成需要的代码，如图 1-7 所示。

```js
let targetCode = generate(ast)
console.log(targetCode)
```

![123](./images/babel-3.png)

图 1-7

转换后的代码谅可以交付给浏览器执行了。以上过程的核心在于代码转换，转换过程的核心在于插件。所以在开发中，Babel 的插件配置是非常关键的一环。

```js
//babel.config.js
module.exports = function (api) {
  const presets = []
  const plugins = [
    '@babel/plugin-transform-arrow-functions',
    '@babel/plugin-transform-runtime',
  ]

  return { presets, plugins }
}
```

如果配置了多个插件，那么执行顺序是按照从前到后依次执行的。

### @babel/polyfill

polyfill 的中文名称叫作垫片，在计算机中指的是对未能实现的客户端进行的“兜底”操作。对前端开发而言，如果部分 js 特性在个别浏览器（特别是 IE）上不支持，但是这些浏览器又需要兼容，那么就需要提供一种机制使其能够正常运行。例如，ES6 的 object.assign 方法，即使在 IE11 中运行也会报错。

例如 ES6 的 object.assign 方法，即使是在 IE11 中运行也会报错

```
Object doesn't support propery or method 'assign'
```

对于这样独立的 polyfill 包有很多选择，如 core-js、object-assign 包、babel 的 transform-object-assign、babel-loader，也可以选择使用 Polyfill.io 服务，服务器会判断浏览器 UA 返回不同的 polyfill 文件，你所要做的仅仅是在页面上引入这个文件，polyfill 这件事就自动以最优雅的方式解决了。

当然，@babel/polyfill（7.4.0 版本后已经废弃）也是一种选择，它直接提供了通过改变全局来兼容新 API，可以在入口文件中引入下面的代码：

```js
import '@babel/polyfill'
```

或者添加在 webpack.config.js 的 entry 数组中：

```js
module.exports = {
  entry: ['@babel/polyfill', './app/js'],
}
```

该包会在项目代码前插入所有的 polyfill 代码，因为它带来的改变是全局的，在 7.4.0 版本以后可以使用：

> import "core-js/stable";
> import "regenerator-runtime/runtime";

### @babel/runtime 和@babel/plugin-transform-runtime

当全局导入 polyfill 包时，会造成全局污染，这显然不是一个很好的解决方案。因为当浏览器支持特性时，polyfill 也就不是必需的。

@babel/plugin-transform-runtime 是对 Babel 编译过程中产生的 helper 方法进行重新利用（聚合），以达到减少打包体积的目的。此外还有个作用是为了避免全局补丁污染，对打包过的 bunler 提供“沙箱”式的补丁。

```shell
npm install --save-dev @babel/plugin-transform-runtime
```

需要在生产环境中加入@babel/runtime，

```shell
npm install --save @babel/runtime
```

在 Babel 的配置文件中增加如下所示配置：

```json
"plugins": ["@babel/plugin-transform-runtime"]
```

也可以带具体的参数：

```json
{
  "plugins": [
    [
      "@babel/plugin-transform-runtime",
      {
        "absoluteRuntime": false,
        "corejs": false,
        "helpers": true,
        "regenerator": true,
        "version": "7.0.0-beta.0"
      }
    ]
  ]
}
```

### preset 配置

`@babel/preset-env` 这是一个预设的插件集合，它包含了一组相关的插件，会根据目标环境进行编译和打补丁。具体来讲，是根据参数 targets 来确定目标环境，在默认情况下它可编译为 ES2015，可以根据项目需求进行配置。

```json
presets: [
       [
         "@babel/preset-env",
         {
           // 支持chrome 58+ 及 IE 11+
           "targets": {
             "chrome": "58",
             "ie": "11",
             "edge": "17",
             "safari": "11.1"
           }
         },
       ],
]
```

在预设配置中以 targets 指定了 ES6 向后兼容的浏览器的最低版本，根据兼容的浏览器的最低版本对 ES6 的最新语法的支持性提供需要的转换插件。需要注意的是如果 presets 有多项配置，那么执行顺序是从后到前。

## 1.3 前端面试必知的 ES 语法规范

截止到 2021 年 3 月 9 日，EcmaScript 规范已经发布到了 2021 版的候选版本，6 月份将发布 GA 版。该版本包含了几个实用的特性。本节我们总结一下从 2016（ES7）到 2021 各个规范的新增特性，便于大家综合参考。

### ES2021

（1）String.prototype.replaceAll：在 replaceAll 方法出现之前，字符串替换可以使用 replace 配合正则使用，看下面两个例子。

```js
'aabbcc'.replace(/b/g, '_') // aa__cc

const queryString = 'q=b+c+d'
ueryString.replace(/\+/g, '') //q=bcd
```

上面的代码可将所有的 b 替换成下画线，如果不加正则，则替换第一个字符。

下面使用 replaceAll 实现相同的功能：

```js
'aabbcc'.replaceAll('b', '_') // aa__cc
const queryString = 'q=b+c+d'
queryString.replaceAll('+', '') //q=bcd
```

使用新 API 后，好处有两点：代码的可读性更好，特殊符号不需要再转义。

（2）逻辑赋值运算符。逻辑赋值运算符结合了逻辑运算符和赋值表达式。逻辑赋值运算符有三种：||=、&&= 和??=，如表 1-1 所示。

| 逻辑运算符 | 等价操作       | a 为 x 时赋值 |
| ---------- | -------------- | ------------- |
| a \|\|= b  | a \|\| (a = b) | Falsy         |
| a &&= b    | a && (a = b)   | Truthy        |
| a ??= b    | a ?? (a = b)   | Nullish       |

表 1-1

这个操作符也同样遵守逻辑短路（Short-circuiting）。当将逻辑操作与赋值组合起来时，因为赋值可能会导致副作用（side-effect），所以赋值操作应该是在某种条件下才进行赋值的。无条件地造成副作用会对程序的性能甚至正确性产生负面影响。

```js
const deleteUsers = () => {
  return 'users is empty'
}

const user = {
  id: '71002',
  name: 'houyw',
  isAdmin: true,
}
let users = (user.isAdmin &&= deleteUsers()) // users is empty
```

```js
let goCode = ' I go to coding'
const user2 = {
  id: '71002',
  name: 'houyw',
  isSuperMan: false,
}
let status = (user2.isSuperMan ||= goCode)
console.log(status) // " I go to coding"
```

```js
let x = null
let y = 'hello'
console.log((x ??= y)) // "hello"
console.log((x = x ?? y)) // "hello
```

（3）WeakRef。通常来说，对 JavaScript 对象的引用都是强引用。也就是说，一旦保持对某个对象的引用，这个对象就不会被垃圾回收。但是在 ES6 中引入了 WeakMap 和 WeakSet，这两者中的对象都是弱引用，垃圾回收机制不考虑 WeakSet 、WeakMap 对集合中对象的引用，只要这些对象不再被引用，垃圾回收机制会自动回收该对象的内存，不考虑该对象是否还存在于 Weak 集合中。

```js
const wm = new WeakMap()

const ref = {}
const metaData = 'foo'
wm.set(ref, metaData)
wm.get(ref)
// → metaData
```

此时，在该代码块中不再保持对对象 ref 的引用，垃圾回收机制随时可以对它进行回收。

WeakMap 和 WeakSet 不是真正的弱引用，只要 key 是活动的，还是会保持这强引用。 一旦 key 被垃圾回收，Weak 集合仅弱引用其内容。

WeakRef 是一个高级 API，它提供了真正的弱引用，允许创建对象的弱引用，跟踪现有对象时不会阻止对其进行垃圾回收，这对于缓存和对象映射非常有用。当浏览器需要进行垃圾回收时，如果对该对象的唯一引用来自 WeakRef 变量，则 JavaScript 引擎可以安全地从内存中删除该对象并释放空间。

```js
const myWeakRef = new WeakRef({
  name: 'Cache',
  size: 'unlimited',
})
console.log(myWeakRef.deref())
```

使用 WeakRef 的构造方法构造一个实例，通过实例的 deref 方法访问变量。

FinalizationRegistry 接收一个注册器回调函数，可以利用该注册器为指定对象注册一个事件监听器。当对象被垃圾回收之后，会触发监听的事件。首先，创建一个注册器：

```js
const registry = new FinalizationRegistry((v) => {})
```

接着，注册一个指定对象，同时指定给注册器回调传递的参数：

```js
registry.register(taget, 'some value')
```

（4）数字分隔符。数字分隔符提供了一种能使大数字更易于阅读和使用的简单方法。

```
1000000000000      1_000_000_000_000
1019436871.42      1_019_436_871.42
```

（5）Promise.any。接收几个 Promise 对象，只要其中任意一个 promise 成功，就返回那个已经成功的 promise。如果所有的 promise 都失败，就返回一个失败的 promise。

```js
const promise1 = new Promise((resolve, reject) => {
  reject('失败')
})
const promise2 = new Promise((resolve, reject) => {
  setTimeout(resolve, 500, 'slower')
})
const promise3 = new Promise((resolve, reject) => {
  setTimeout(resolve, 100, 'faster')
})

const promises = [promise1, promise2, promise3]
Promise.any(promises).then((value) => console.log(value))
// faster
```

下面对 Promise.all 和 Promise.race 做一个简单对比。Promise.all：只要有一个 promise 失败，就返回失败；当所有的 promise 都成功后才返回成功。Promise.race: 只要有一个 promise 状态发生改变，就返回该 promise。

### ES2020

（1）String.protype.matchAll，matchAll 方法返回一个正则表达式在字符串的所有匹配。下面先实现一个例子匹配十六进制的字符：

```js
const string = 'Magic hex numbers: DEADBEEF CAFE'
const regex = /\b\p{ASCII_Hex_Digit}+\b/gu
for (const match of string.matchAll(regex)) {
  console.log(match)
}
```

返回结果如下：

```js
[
  'DEADBEEF',
  index: 19,
  input: 'Magic hex numbers: DEADBEEF CAFE',
  groups: undefined
]
[
  'CAFE',
  index: 28,
  input: 'Magic hex numbers: DEADBEEF CAFE',
  groups: undefined
]
```

（2）动态导入(dynamic import) 动态导入提供了一种类似函数的新导入形式，与静态导入相比，有更多的新功能。

先看一下静态导入：

```js
//utils.mjs
export default () => {
  console.log('Hi from the default export!')
}

// Named export `doStuff`
export const doStuff = () => {
  console.log('do something')
}
```

接下来就可以在 script 中导入了：

```js
<script type="module">
  import * as module from './utils.mjs'; module.default(); // 'Hi from the
  default export!' module.doStuff(); // 'do something'
</script>
```

这种导入模块的语法形式是一个静态声明：它仅接受字符串文字作为模块标识，通过运行前的“链接”过程，引入绑定（bindings）到本地作用域中。 静态导入只能在文件的顶层使用。

import(specifier)函数支持动态加载模块。import 函数的参数 specifier，可指定所要加载的模块的位置，并返回 promise 对象。

```js
<script type="module">
  const moduleSpecifier = './utils.mjs'; import(moduleSpecifier) .then((module)
  => {});
</script>
```

（3）BigInt。它提供了一种表示大于 2^53 - 1 的整数的方法，也就是说，可以表示任意大的整数。具体用法是通过在一个整数字面量后面加 n 的方式定义一个 BigInt 类型。

```js
let bn = BigInt(Number.MAX_SAFE_INTEGER) + 2n
console.log(bn) // 9007199254740993n
const alsoHuge = BigInt(9007199254740991)
console.log(alsoHuge) //9007199254740991n
const hugeString = BigInt('9007199254740991')
console.log(hugeString) //9007199254740991n
const hugeHex = BigInt('0x1fffffffffffff')
console.log(hugeHex) //9007199254740991n

console.log('is BigInt:', typeof 2n === 'bigint')
```

（4）Optional Chaining（可选链操作符）`?.`也叫作链判断运算符。允许开发人员读取深度嵌套在对象链中的属性值，而不必验证每个属性是否都存在。当引用为空时，返回 undefined。

```js
var travelPlans = {
  destination: "xi'an",
  monday: {
    location: 'shangxi',
    time: '23:20',
    no: 'mu5716',
  },
}
console.log(travelPlans.tuesday?.location) //undefined
console.log(travelPlans.monday?.location) //shangxi
```

（5）Nullish coalescing(空位操作符)?? 运算符被称为空位操作符。如果第一个参数不是 falsely，将返回第一个参数，否则返回第二个参数。

```js
console.log(false ?? true) // => false
console.log(0 ?? 1) // => 0
console.log('' ?? 'default') // => ''
console.log(null ?? []) // =>[]
console.log(undefined ?? []) // => []
```

（6）globalThis。获取不同环境的 this，在 ES2020 规范之前，可以封装一层：

```js
const getGlobalThis = () => {
  // 适用webworker、service worker
  if (typeof self !== 'undefined') return self

  // 浏览器
  if (typeof window !== 'undefined') return window

  // Node.js
  if (typeof global !== 'undefined') return global

  // JavaScript shell
  if (typeof this !== 'undefined') return this

  throw new Error('Unable to locate global object')
}
```

现在就可以按照如下使用：

```js
const theGlobalThis = getGlobalThis()
```

（7）模块命名空间导出（module namespace export）。

```js
import * as utils from './utils.mjs'
export { utils }
```

（8）Promise.allSettled。Promise.allSettled 接受一组 Promise，返回新的 Promise 实例。等到所有这些参数实例都返回结果，不管是 fulfilled 还是 rejected。

```js
const promise1 = Promise.resolve(3)
const promise2 = new Promise((resolve, reject) =>
  setTimeout(reject, 100, 'foo')
)
const promises = [promise1, promise2]

Promise.allSettled(promises).then((results) =>
  results.forEach((result) => console.log(result.status))
)
```

### ES2019

（1）Array.flat 和 Array.flatMap：如果数组的成员还是数组，则 flat 可将嵌套的数组“拉平”，变成一维数组，指定“拉平”级数。该方法返回一个新数组，对原始数据没有影响。

```js
let origin = [1, ['aa', 'bb'], [3, ['cc', 'dd']]]
let _flat = origin.flat(2)
console.log(_flat) //[ 1, 'aa', 'bb', 3, 'cc', 'dd' ]
console.log(origin) // [ 1, [ 'aa', 'bb' ], [ 3, [ 'cc', 'dd' ] ] ]
```

`flatMap()`只能展开一层数组

```js
const duplicate = (x) => [x, x]
let result = [2, 3, 4].flatMap(duplicate) // [ 2, 2, 3, 3, 4, 4 ]
```

（2）Object.fromEntries：将键值对数组转为对象。

```js
let _entry = Object.entries({ name: 'ass', age: 22 })
console.log(_entry) //[ [ 'name', 'ass' ], [ 'age', 22 ] ]

let putorigin = Object.fromEntries(_entry)
console.log(putorigin) //{ name: 'ass', age: 22 }
```

（3）String.trimStart 和 String.trimEnd。trimStart 去掉字符串头部的空格，`trimEnd` 去掉尾部的空格。它们都返回新字符串，不影响原始字符串。

```js
const s = '  houyw  '

console.log(s.trim()) //houyw
console.log(s.trimStart()) // 'houyw  '
console.log(s.trimEnd()) // '  houyw'
```

Arrary.sort 稳定排序：早期的规范没有规定该方法是否稳定，而是留给浏览器实现。在对象排序时可能无法达到预期的目的。所以在 ES2019 中规定该排序必须稳定。

```js
const doggos = [
  { name: 'Abby', rating: 12 },
  { name: 'Bandit', rating: 13 },
  { name: 'Choco', rating: 14 },
  { name: 'Daisy', rating: 12 },
  { name: 'Elmo', rating: 12 },
]
doggos.sort((a, b) => b.rating - a.rating)
```

（4）JSON.stringfy 改造：如果遇到 0xD800 到 0xDFFF 之间的单个码点，或者不存在的配对形式，则返回转义字符串。

（5）Symbol description 属性：ES2019 为 Symbol 提供了一个实例属性`description`，可以查看 Symbol 的描述。

```js
const sym = Symbol('des')

sym.description // "des"
```

### ES2018

（1）对象的 Rest/Spread：ES6 中 为数组引入了扩展运算符的功能，从 ES2018 中，对象也开始支持。

```js
const person = {
  firstName: 'yw',
  lastName: 'hou',
  country: 'henan',
  state: 'cn',
}
const { firstName, lastName, ...rest } = person
console.log(firstName) //yw
console.log(lastName) //hou
console.log(rest) //{ country: 'henan', state: 'cn' }

// Spread properties for object literals:
const personCopy = { firstName, lastName, ...rest }
console.log(personCopy) //{ firstName: 'yw', lastName: 'hou', country: 'henan', state: 'cn' }
```

（2）Promise.finally：该方法用于指定不管 Promise 对象的最后状态如何，都会执行的操作。

```js
fetch(url)
.then(result => {···})
.catch(error => {···})
.finally(() => {···});
```

（3）异步迭代器：循环遍历异步可迭代对象以及同步可迭代对象，包括内置的 String、 Array，类似数组对象 （例如 arguments 或 NodeList、TypedArray、Map、Set ）和用户定义的异步或同步迭代器。

```
async function* asyncGenerator() {
  var i = 10;
  while (i < 3) {
    yield i++;
  }
}

(async function() {
  for await (num of asyncGenerator()) {
    console.log(num);
  }
})();
```

（4）正则表达式：ES2018 引入 `s`修饰符(`dotAll`模式)，使`.`可以匹配任意单个字符。

```js
;/obj.name/s.test('obj\nname') // true
```

ES2018 为正则也引入了具名组匹配（Named Capture Groups），为每一组匹配指定一个名字，既便于阅读代码，又便于引用。

```js
const RE_DATE = /(?<year>\d{4})-(?<month>\d{1,2})-(?<day>\d{2})/

let matchObj = RE_DATE.exec('2021-4-24')
console.log(matchObj.groups.year) //2021
console.log(matchObj.groups.month) //4
console.log(matchObj.groups.day) //24
```

### ES2017

（1）Object.values/Object.entries：Object.values 方法返回一个数组，返回对象自身的（不含继承的）所有可遍历（enumerable）属性的值。

```js
const obj = { foo: 'bar', baz: 42 }
console.log(Object.values(obj)) //[ 'bar', 42 ]
```

`Object.entries`方法返回一个数组，返回对象自身的（不含继承的）所有可遍历（enumerable）属性的键值对数组，该方法也适合数组。

```js
const person = { name: 'houyw', age: 19 }
console.log(Object.entries(person))

const people = ['Fred', 'Tony']
console.log(Object.entries(people)) //[ [ '0', 'Fred' ], [ '1', 'Tony' ] ]
```

（2）字符串补全：`padStart(targetLength [, padString)`用于头部补全，`padEnd(targetLength [, padString)`用于尾部补全

```js
'x'.padStart(4, 'ab') // 'abax'
'x'.padEnd(5, 'ab') // '
```

（3）异步函数（asnyc）：异步函数是 Promise 和 Generators（生成器）的组合，简化了 Promise 调用，提高了代码的可读性。

```js
async function getData() {
  const res = await fakeRequest()
  console.log(res)
}
```

（4）Object.getOwnPropertyDescriptors：该方法返回对象的自身属性，不包括继承的。

```js
const person = { name: "houyw", age: 19 };
Object.getOwnPropertyDescriptors(person)
//输出
{
  name: {
    value: 'houyw',
    writable: true,
    enumerable: true,
    configurable: true
  },
  age: { value: 19, writable: true, enumerable: true, configurable: true }
}
```

## 1.4 Deno Web 实践

eno 是 nodejs 作者 Ryan Dahl 于 2017 年创立的项目，至今已经发布到了 1.9.2 版本。这是一个安全的 TypeScript/JavaScript 运行时，该运行时是在 V8 的基础上使用 Rust 开发的，同时内置了 tsc 引擎，用来解释 typescript。event-loop 由 tokio 提供支持。由于 Rust 原生支持 WebAssembly，所以能直接运行 WebAssembly。

Deno 的主要特性如下：

- 默认安全，外部代码没有文件系统、网络、环境的访问权限，除非显式开启。

- 支持开箱即用的 TypeScript 的环境。

- 只分发一个独立的可执行文件（deno）。

- 有内建的工具箱，比如依赖信息查看器（deno info）和代码格式化工具（deno fmt）。

- 有一组经过审计的标准模块，保证能在 Deno 上工作。

- 脚本代码能被打包为一个单独的 JavaScript 文件。

Deno 和 Node.js 的作者虽然是同一个人，但面向的对象是不同的。众所周知，Node.js 面向的是服务端，而 Deno 面向的是浏览器生态。所以，Deno 并不是要取代 Node.js，也不是下一代 Node.js，更不是要放弃 npm 重建 Node 生态。下面我们对两者进行简单的对比，如表 1-2 所示。

|          | nodejs           | Deno                      |
| -------- | ---------------- | ------------------------- |
| API 引入 | 模块导入         | 全局                      |
| 模块类型 | CommonJS，ESM    | ESM，也可以是远程的模块   |
| 安全策略 | 默认无安全限制   | 默认安全                  |
| TS 支持  | 需要其他模块支持 | 开箱即用                  |
| 包管理   | npm 包           | 原生 ESM 支持，不需要 npm |
| 包分发   | npm 仓库         | 去中心化                  |
| 入口文件 | package.json     | 直接引入文件              |

表 1-2

下面通过一个例子看看 Deno 是怎样运行的：

```js
//hello-world.js
function say() {
  console.log('hello,world')
}
say()
```

使用`deno run <文件名>`运行文件：

```js
hello, world
```

下面再测试一下 TypeScript，验证一下是否开箱即用。新建一个 ts-test.ts 文件，输入以下内容：

```typescript
interface Person {
  name: string
  age: number
}

function greeter(person: Person) {
  return "I'm " + person.name + ', age: ' + person.age
}

let _name: string = 'houyw'
let _age: number = 18

let info = greeter({
  name: _name,
  age: _age,
})

console.log(info)
//输出： I'm houyw, age: 18
```

经测试，不需要对 TS 文件进行任何配置即可正常执行。

Deno 是如何 import 和 export 的呢？前面介绍过，Deno 是遵从 ES module 规范的，所以可以通过 export 暴露模块，使用 import 导入模块。先在 module 中暴露 add 和 multiply 两个方法。

```typescript
export function add(a: number, b: number): number {
  return a + b
}
export function multiply(a: number, b: number): number {
  return a * b
}
```

在入口文件中导入该模块

```typescript
import { add, multiply } from '../libs/utils.ts'

console.log(add(19, 51)) //70
console.log(multiply(10, 10)) //100
```

下面看一下 Deno 怎样读取文件的。新建 person.json 和 readx.ts 文件：

```json
{
  "name": "houyw",
  "age": "12",
  "children": [
    {
      "name": "侯xx",
      "age": 9
    },
    {
      "name": "侯xx",
      "age": 3
    }
  ]
}
```

```typescript
const text = Deno.readTextFile('./person.json')

text.then((response) => console.log(response))
```

我们先按照上面的执行方法执行下 readx.ts 文件，看能否正常执行，如图 1-8 所示。

```shell
deno run readx.ts
```

![](./images/deno-1.png)

图 1-8

从图中可以看出，和我们预想的结果并不一样。前面介绍过，Demo 默认没有模块、文件和网络权限，所以在执行的时候添加需要开启读文件权限，如图 1-9 所示。

```
deno run --allow-read readx.ts
```

![](./images/deno-2.png)

图 1-9

在 Deno 中除读权限外，还有其他权限：

- `-A, --allow-all` ：开启或屏蔽所有权限。
- `--allow-env` ：设置环境变量权限。例如，读取和设置环境变量。
- `--allow-hrtime` ：允许高精度时间测量。高精度时间能够在计时攻击和特征识别中使用。
- `--allow-net=<allow-net>` ：允许网络访问权限。多个域名之间用逗号分隔，来提供域名白名单。
- `--allow-plugin`： 允许加载插件权限
- `--allow-read=<allow-read>` ：允许读取文件系统权限。多个目录或文件用逗号分隔，来提供文件系统白名单。
- `--allow-run`： 运行执行子进程权限，需要注意的是子进程并不是在沙箱中执行，所以需要特别注意。
- `--allow-write=<allow-write>`： 允许写入文件系统。多个目录或文件用逗号分隔，提供文件系统白名单。

下面再来看几个需要指定权限的例子。

（1）使用 fetch 方法请求 Deno REST API，代码如下所示。

```js
//fetch.js
const res = await fetch('https://api.github.com/users/denoland')
const data = await res.json()
console.log(data)
```

运行该文件，结果如图 1-10 所示。

```shell
deno run fetch.js
```

![](./images/deno-3.png)

图 1-10

加上必要的参数：

```shell
deno run --allow-net fetch.js
```

```json
{
  "login": "denoland",
  "id": 42048915,
  "node_id": "MDEyOk9yZ2FuaXphdGlvbjQyMDQ4OTE1",
  "avatar_url": "https://avatars.githubusercontent.com/u/42048915?v=4",
  "gravatar_id": "",
  "url": "https://api.github.com/users/denoland",
  "html_url": "https://github.com/denoland",
  "followers_url": "https://api.github.com/users/denoland/followers",
  "following_url": "https://api.github.com/users/denoland/following{/other_user}",
  "gists_url": "https://api.github.com/users/denoland/gists{/gist_id}",
  "starred_url": "https://api.github.com/users/denoland/starred{/owner}{/repo}",
  "subscriptions_url": "https://api.github.com/users/denoland/subscriptions",
  "organizations_url": "https://api.github.com/users/denoland/orgs",
  "repos_url": "https://api.github.com/users/denoland/repos",
  "events_url": "https://api.github.com/users/denoland/events{/privacy}",
  "received_events_url": "https://api.github.com/users/denoland/received_events",
  "type": "Organization",
  "site_admin": false,
  "name": "Deno Land",
  "company": null,
  "blog": "https://deno.land",
  "location": "NYC, USA",
  "email": "deploy@deno.com",
  "hireable": null,
  "bio": null,
  "twitter_username": "deno_land",
  "public_repos": 26,
  "public_gists": 0,
  "followers": 0,
  "following": 0,
  "created_at": "2018-08-02T22:47:41Z",
  "updated_at": "2021-03-31T14:25:32Z"
}
```

通过这个例子可以看出，如果需要网络权限，则必须显示指定。如果不指定具体的域名，则默认可以访问全部的域名。如果指定具体的域名，则只能访问指定的域名。

```shell
deno run --allow-net=api.github.com fetch.js
```

设置环境变量，如图 1-11 所示。

```js
//read_env.ts
Deno.env.set('APPLICATION_NAME', 'deno_test')
console.log(Deno.env.get('APPLICATION_NAME'))
```

```
deno run read_env.ts
```

![](./images/deno-4.png)

图 1-11

```
deno run --allow-env read_env.ts
```

打印出`deno_test`.

##### 加载三方包

Deno 没有包管理工具，所以不需要创建 package.json。Deno 提供了通过 URL 引入第三方包的形式。Deno 提供了官方的资源库，到目前为止，已经有 2170 个模块可供选择。

我们以 BCrypt 为例，介绍一下如何引入第三方库。

```typescript
import * as bcrypt from 'https://deno.land/x/bcrypt/mod.ts'
const hash = await bcrypt.hash('hello,world')
console.log(hash)
```

需要说明的是，第三方库都是以“https://deno.land/x”开头的，后面跟第三方库标识和入口文件。

```shell
➜  deno-intro git:(master) ✗ deno run --allow-net --unstable module.ts
Check file:///Users/eason/Desktop/github/front-end-complete-book/chapter01/code/deno-intro/module.ts
Download https://deno.land/x/bcrypt@v0.2.4/src/worker.ts
Check https://deno.land/x/bcrypt@v0.2.4/src/worker.ts
$2a$10$NPIstDpWGv90.99/Xjz3euey/eVvyjKpDC6cys508aiqT3NIWCaKi
```

在引用第三方库时，应先从资源库中下载文件，然后执行。

创建服务器

Deno 中也有和 Web 相关的模块，即 http 服务。该模块和 Node.js 的 http 模块功能相同，都是提供一套封装级别很低的 API，仅仅是流控制和简单的解析。

```typescript
import { serve } from 'https://deno.land/std@0.95.0/http/server.ts'
const server = serve({ port: 9001 })
console.log('http://localhost:9001/')
for await (const req of server) {
  req.respond({ body: 'Hello, this is from deno server' })
}
```

首先导入 serve 模块，并指定端口`9001`，在返回的 Server 实例中遍历出 Listener 对象，为每个请求指定返回的内容体，如图 1-12 所示。

![](./images/deno-5.png)

图 1-12

Deno web 开发

做过 Node.js Web 开发的朋友，对 Express、Koa 这些 Web 应用开发框架都不会陌生，特别巧合的是这两者也是师出同门，Koa 是 Express 原班人马在 ES6 新特性中重新开发的框架，主要基于 co 中间件，框架自身不包含任何中间件，很多功能需要借助第三方中间件实现。

同样的，在 Deno 平台中如果想做 Web 应用开发，也有几个“轮子”可供选择，即可以考虑使用以下现成的框架：

- oak（start 数量：3.2K）。
- deno-drash（start 数量：829）。
- servest（start 数量：704）。
- abc（start 数量：528）。
- pogo（start 数量：359）。
- deno-express（start 数量：242）。

GitHub 上的 star 数量可反映出开发人员对框架的接受程度。我们以 oak 作为目标工具详细介绍如何开发一个 Web 应用。

在 oak 的官网介绍中，有一句让人眼前一亮的描述：

> A middleware framework for Deno’s [http](https://github.com/denoland/deno/tree/master/std/http#http) server, including a router middleware.
>
> This middleware framework is inspired by [Koa](https://github.com/koajs/koa) and middleware router inspired by [@koa/router](https://github.com/koajs/router/). -来自 oak 官网

它的灵感来自于 Koa，而路由中间件的灵感来源于 koa-router 。这不就是我们需要的工具吗？框架提供底层能力，功能由三方的中间件实现，把最大的灵活性留给开发者，给开发者提供最大的灵活性。所以如果你以前使用过 Koa 的话，那么你也会很容易就能上手 oak。

oak 使用 mod.ts 中的 Application 声明一个应用。

```typescript
import { Application } from 'https://deno.land/x/oak/mod.ts'
const app = new Application()
```

mod.ts 中提供了很多功能，如 Router、request、response、FormDataBody 和 cookie 等。

在 Application 初始化之后，就可以使用 app.use 引用我们需要的中间件，如日志模块、权限模块、路由模块等。使用 app.listen 注册应用程序端口。

在 Web 应用中有一个很重要的模块是路由，URL 根据 path 匹配结果渲染指定的页面或者返回对应的数据。

先声明一下路由主文件：

```typescript
import { Router } from 'https://deno.land/x/oak/mod.ts'
import sayHello from './handlers/hello.ts'
import main from './handlers/main.ts'
const router = new Router()

router.get('/', sayHello)
router.get('/main', main)
export default router
```

当 path 为“/”时，调用 sayHello 模块；当 path 为“/main”时，渲染 main 模块。

下面看一下这两个模块的具体实现：

```typescript
//handlers/hello.ts
import { Response, RouteParams } from 'https://deno.land/x/oak/mod.ts'
export default async ({
  params,
  response,
}: {
  params: RouteParams
  response: Response
}) => {
  response.body = { msg: 'hello,oak router' }
}
```

```typescript
// handlers/main.ts
import { Response, RouteParams } from 'https://deno.land/x/oak/mod.ts'
export default async ({
  params,
  response,
}: {
  params: RouteParams
  response: Response
}) => {
  response.body = 'This is main module'
}
```

接着，使用 app.use 在应用中加入路由中间件，使路由生效。

```typescript
import router from './routing.ts'
app.use(router.routes())
await app.listen({ port: 9002 })
```

现在启动页面进行测试，测试结果如图 1-13 和图 1-14 所示。

```shell
deno run --allow-net web/index.ts
```

![](./images/deno-6.png)

图 1-13

![](./images/deno-7.png)

图 1-14
