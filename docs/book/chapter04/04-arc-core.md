# 第 4 章 前端核心模块的设计与实现

扎实的基础是学习架构（或 JS 框架）的关键，如果基础掌握得不牢固，则在学习架构或 JS 框架时，必然觉得代码晦涩难懂，无从下手。正所谓“工欲善其事，必先利其器”， 本章将围绕以下内容进行详细阐述：

1. 框架中比较重要的 6 种设计模式。
2. 前端开发人员必须了解的 V8 知识点。
3. 宏任务和微任务的处理过程。
4. 异步加载规范。
5. 函数式编程基础。
6. 通过案例深入剖析状态原理的实现过程。

## 4.1 前端中的 6 种常用设计模式

### 4.1.1 状态模式的实现

状态模式是一个比较有用的模式，它是指当一个对象的内部状态发生变化时，会产生不同的行为。程序在任意时刻都处在任意一种状态中。

比如某电灯，按一下按钮打开弱光, 按两下按钮打开强光, 按三下按钮关闭灯光，基本模型如图 4-1 所示。

<img src="./images/4-1-2.png" style="zoom:67%;" />

图 4-1

状态模式允许对象在内部状态改变时，改变其行为，从对象的角度看好像进行了改变。实际开发中，某处文字可能和模型中的一字段进行关联，根据某一个状态显示不同的内容，这时候状态模式可能是你需要的（当然 switch-case, if-else 可以继续）。

状态模式中有几个角色，分别是 Context、State，以及各个子状态的实现。Context 中既保存了 Client 端的操作接口，也保存子状态的实现，代表着当前状态。抽象类 State 声明了子状态应该实现的各个方法，如图 4-2 所示。

<img src="./images/state.png" style="zoom:67%;" />

图 4-2

Context 的实现如下：

```ts
export default class Context {
  private state: State
  constructor(state: State) {
    this.transitionTo(state)
  }

  public transitionTo(_s: State): void {
    console.log(`Context: transition to ${(<any>_s).constructor.name}`)
    this.state = _s
    this.state.setContext(this)
  }

  public setSlighLight(): void {
    this.state.slightLight()
  }

  public setHightLight(): void {
    this.state.highLight()
  }

  public close(): void {
    this.state.close()
  }
}
```

在 transitionTo 方法中改变当前状态，参数为实例化的子状态类。如果需要将上下文转换为另一个状态，只需要将当前活动的状态对象替换为新的状态对象即可。需要说明的是，如果想采用这种方式，状态的各子类必须保证实现相同的接口。

> 为什么要实现相同的接口呢？大家可以类比下面向对象中的多态特性。多态具体说就是在父类中定义的属性和方法被子类继承之后，子类就具有不同的表现形式和形态的能力。它可以消除类型之间的强耦合关系，让子类具有了可替换性，所以就更加的灵活。

再来看 State 的实现及其 SlightLightClass 的实现，限于篇幅，这里只贴出部分代码，完整的代码[参考外链<4-1>](https://github.com/houyaowei/front-end-complete-book/tree/master/chapter04/code/4.1DesignPattern/State)。

```ts
export default abstract class State {
  protected context: Context
  public setContext(_c: Context) {
    this.context = _c
  }
  public abstract slightLight(): void
  public abstract highLight(): void
  public abstract close(): void
}
```

> 注意，如果对 TypeScript 的抽象类语法还不是很理解，则可以参考官网的 class 部分：

```ts
export default class SlighLightClass extends State {
  public slightLight(): void {
    console.log('state in SlighLightClass, I will change state to highLight') //切换到新的状态
    this.context.transitionTo(new HighLight())
  }

  public highLight(): void {
    console.log('hightstate state in SlighLightClass')
  }

  public close(): void {
    console.log('close state in SlighLightClass')
  }
}
```

下面来测试一下：

```ts
import Context from './Context'
import SlightLight from './SlightLightClass'
import CloseLight from './CloseClass'

// const context = new Context(new SlightLight());
//我们先用close状态初始化
const context = new Context(new CloseLight())
context.close()
context.setSlighLight()
context.setHightLight()
```

结果如下：

```
Context: transition to ColseClass
state in closeClass, I will change state to slight
Context: transition to SlighLightClass
state in SlighLightClass, I will change state to highLight
Context: transition to HighLightClass
highLight state in HighLightClass
```

现在把初始状态调整为 SlightState，重新编译并运行：

```
Context: transition to SlighLightClass
state in SlighLightClass, I will change state to highLight
Context: transition to HighLightClass
highLight state in HighLightClass
state in hightLight, I will change state to close
Context: transition to ColseClass
```

状态模式封装了转换规则，并枚举了所有可能的状态。当把所有的与某个状态有关的行为放到一个类中时，即可方便地增加状态。

状态模式的使用必然会增加系统类和对象的个数。 状态模式的结构与实现都较为复杂，如果使用不当，则程序结构和代码都将变得混乱。
状态模式对"开闭原则"的支持并不太好，准确说的话是代码的侵入性比较高，对于可以切换状态的状态模式，在增加新的状态类时要求必须修改那些负责状态转换的源代码，否则无法切换到新增的状态。如果需要修改某个状态类的行为，则同样需修改对应类的源代码。

最后一点需要说明的是，如果是状态比较少，并且状态之间很少发生改变，那么使用状态模式是不是显得小题大做了？大家可以根据实际的业务场景再决定看是否必要。

### 4.1.2 策略模式的实现

策略模式是一种行为模式，它允许定义一系列算法，并将各个算法分别放入独立的类中，在运行时可以相互替换。它的主要作用是当多个算法较为相似时，可以减少 if-else 的使用。

策略模式的应用较为广泛，比如年终奖的发放，很多公司都是根据员工的薪资基数和年底绩效考评来计算的。以绩效比例 3+6+1 方式为例，绩效为 3 的员工，年终奖为 2 倍工资；绩效为 6 的员工年终奖为 1.2 倍工资；绩效为 1 的员工，年终奖为 X.X 倍工资。

下面以一个简单的字符串数组操作为例对改模式详细解释，对 sort 和 reverse 方法，定义两种策略，根据需要执行对应的策略。UML 描述如下图 4-3 所示。

<img src="./images/strategy.png" alt="strategy" style="zoom: 67%;" />

图 4-3

首先，声明一个策略接口：

```ts
interface Strategy {
  toHandleStringArray(_d: string[]): string[]
}
```

然后，实现 sort 方法的策略实现（这里不讨论 sort 方法的缺陷）:

```ts
class StrategyAImpl implements Strategy {
  public toHandleStringArray(_d: string[]): string[] {
    //其他业务逻辑
    return _d.sort()
  }
}
```

接着，看看 reverse 方法的策略实现:

```ts
class StrategyBImpl implements Strategy {
  public toHandleStringArray(_d: string[]): string[] {
    //其他业务逻辑
    return _d.reverse()
  }
}
```

从上述代码可知，如果想实现数组的其他策略，则只需实现对应的接口，即可在不扩展类的情况下向用户提供能改变其行为的方法。

现在还缺少一个关键的零件，即改变策略的载体————Context 类：

```ts
class Context {
  private strategy: Strategy
  constructor(_s: Strategy) {
    this.strategy = _s
  }

  public setStrategy(_s: Strategy) {
    this.strategy = _s
  }

  //执行的方法是策略中定义的方法
  public executeStrategy() {
    //标明是哪个策略类
    console.log(
      `Context: current strategy is ${(<any>this.strategy).constructor.name}`
    )
    const result = this.strategy.toHandleStringArray(names)
    console.log('result:', result.join('->'))
  }
}
```

下面测试一下，看看效果。先假定 Context 类中的数组形式如下：

```ts
const names: string[] = ['hou', 'cao', 'ss']
```

首先实例化 reverse 方法的策略：

```ts
const context = new Context(new StrategyB())

context.executeStrategy()
```

效果如下：

```
Context: current strategy is StrategyBImpl
result: ss->cao->hou
```

然后把策略方式切换为 sort 方法，效果如下：

```
Context: current strategy is StrategyAImpl
result: cao->hou->ss
```

这样的策略实现非常的方便，“任你策略千千万，我仍待你如初恋”。策略模式的程序至少由两部分组成。第一部分是一组策略类，里面封装了具体的算法，并负责算法的完整实现。第二部分是上下文(即 Context)，上下文接收客户端的请求，随后被分发到某个策略类。

策略模式借助了组合等思想，可以有效地避免许多不必要的复制、粘贴。另外，它还支持对"开闭原则"，可以把算法封装到具体的策略实现中，易实现、易扩展。

在这里需要补充一下状态模式和策略模式的的微妙关系，状态可以被视为策略的扩展，两者都基于组合机制。它们都是通过将部分工作委派给其他类来改变其在不同场景下的行为。在策略模式下，对象相互之间完全独立。 状态模式没有限制具体状态之间的依赖，且允许它们自行改变在不同场景下的状态。

### 4.1.3 适配器模式的实现

适配器是一种结构型模式，该模式的作用是解决两个接口不兼容的问题。将一种接口，转换成客户期望的另一种接口，即可实现相互通信的目的。

在现实中，适配器的应用比较广泛。比如，国外的电源插头的体积比国内的电源插头的体积要大一些，如果从国外买了一台 Macbook Pro，则电源插头是无法直接插到国内家里的插座上的，为了一个电源插头而改造家中已经装修好的插座显然不太合适，此时就需要一个适配器了。

下面通过简单的代码来描述适配器模式。

假设想实现一个音乐播放的方法，常见的音乐文件格式有很多种，如 mp3、mp4、wma、mpeg、rm 和 vlc 等。常见的音乐播放文件也是五花八门，如 MediaPlay、 千千静听、 RealPlay，等等。播放器并不是万能的，它不能播放所有的文件格式，如果使用适配器模式，则可以兼容播放所有格式的文件。

该模式的工作方式如下，UML 如图 4-4 所示。

- 适配器要实现一个与目标对象兼容的接口。

- 目标对象可以使用该方法安全地调适配器接口。

- 调用适配器的方法后，会将另一个对象的兼容格式传给目标对象。

<img src="./images/adapter.png" alt="adapter" style="zoom:50%;" />

图 4-4

首先，定义一个通用的播放接口：

```ts
export default interface Target {
  play(type: string, fileName: string): void
}
```

play 方法需要两个参数：文件类型和文件名。因为需要根据文件类型做适配，所以这两个参数是必需的。

播放接口要支持最常见的音乐文件格式（如 mp3），当然建议支持更丰富的格式（如 mp4），以便看视频。

然后，定义一个高级播放接口：

```ts
export default interface AdvanceTarget {
  playVlcType(fileName: string): void

  playMp4Type(fileName: string): void
}
```

下面实现两个具体的播放类，一个可播放 vlc 格式的文件，另一个可播放 mp4 格式的文件：

```ts
export default class VlcPlayer implements AdvancePlayer {
  public playVlcType(fileName: string): void {
    console.log(`${fileName} is palying!`)
  }

  public playMp4Type(fileName: string): void {
    //假定vlc播放器不能播放mp4格式的文件
  }
}
```

```ts
export default class Mp4Player implements AdvancePlayer {
  public playVlcType(fileName: string): void {
    // 假定mp4播放器不能播放vlc格式的文件
  }

  public playMp4Type(fileName: string): void {
    console.log(`${fileName} is palying`)
  }
}
```

下面实现适配器类，以便更好地解释适配器是如何架起两种接口通信的：

```ts
class MediaAdatper implements Target {
  private advanceTarget: AdvanceTarget

  constructor(type: string) {
    if (type === 'vlc') {
      this.advanceTarget = new VlcPlayer()
    }
    if (type == 'mp4') {
      this.advanceTarget = new Mp4Player()
    }
  }

  public play(type: string, fileName: string): void {
    if (type === 'vlc') {
      this.advanceTarget.playVlcType(fileName)
    }
    if (type == 'mp4') {
      this.advanceTarget.playMp4Type(fileName)
    }
  }
}
```

适配器类中持有高级接口的引用，可根据文件类型初始化相应的类，因此在 play 方法中就有了相应的实例，可以调用具体的方法。

当适配器初始化好之后，即可使用播放器播放音乐：

```ts
class Player implements Target {
  mediaAdapter: MediaAdapter
  play(type: string, fileName: string): void {
    if (type == 'mp3') {
      //mp3直接播放
    } else if (type === 'vlc' || type == 'mp4') {
      this.mediaAdapter = new MediaAdapter(type)
      this.mediaAdapter.play(type, fileName)
    }
  }
}
```

下面进行下测试：

```ts
const player = new Player()

player.play('mp4', '笑看风云.mp4')
player.play('vlc', '烟雨唱扬州.vlc')
player.play('mp3', '背水姑娘.mp3')
player.play('wma', '左手指月.mp3')
```

测试结果如下：

```
笑看风云.mp4 is palying
烟雨唱扬州.vlc is palying!
Mp3 as the basic format, can play at will
sorry,type wma is not support
```

从上面的测试结果可以看出，通过适配器，两个不同的接口可以通信了。

下面总结一下适配器的优点：

- 它将接口或者数据转换代码分离了出来，使代码看起来非常清晰。
- 它遵循“开闭原则”，能在不修改现有客户端代码的情况下在程序中添加新类型的适配器。

适配器模式使整体复杂度增加，这是因为每增加一种需要适配的类型，就需要增加相应的接口和实现类。

### 4.1.4 观察者模式的实现

观察者模式（Observer Pattern）又叫作发布——订阅模式(Pub/Sub)模式或消息机制。它可以帮助对象知晓现状，以便对象及时响应订阅的事件，可以看成是一种一对多的关系。当订阅的对象的状态发生改变时，所有依赖它的对象都应得到通知。
观察者模式是松耦合设计的关键。
现实生活中，大家都经常在某宝上购物，下面通过一个购物例子来理解观察者模式。
当你在某宝上找到一款心仪的电脑时，比如 16 寸的 Mackbook Pro，联系某卖家后发现没有现货，鉴于此店铺较好的信誉度和较大的优惠力度，你觉得还是在这家店铺买比较划算，于是就问卖家什么时候有货。卖家回复说需要等一周左右，还友情提示你:"亲，你可以先收藏我们的店铺，等有货了会再通知你的。"因此你收藏了这家店铺。电脑发烧友可不止你一个，小明、小华等陆陆续续也都收藏了该店铺。
从上面的示例中可以看出，这是一个典型的观察者模式，卖家是发布者(Publisher)，你、小明、小华等是订阅者(subscribers)。当 16 寸的 Mackbook Pro 到货时（即状态发生了改变），卖家会使用旺旺等工具通知你、小明、小华等，依次给你们发送消息，"亲，货品已经到了，您可以下单了"。

基本模型如图 4-5 所示。

<img src="./images/4-1-1.png" style="zoom:67%;" />

图 4-5

在图 4-5 中可以看出，卖家（发布者）维护着和各位客户（订阅者）的引用关系，并且可以通过观察者模式添加、解除引用关系。比如，当某天某客户不再中意这款电脑时，卖家（发布者）就无法再引用这份关系了。

> 本书中所有的代码均是用 Typescript 编写的，众所周知，Typescript 是 JavaScript 的超集，具有强类型约束，在编译期即可消除安全隐患。

UML 描述如图 4-6 所示

<img src="./images/observer1.png" alt="observer" style="zoom: 50%;" />

图 4-6

下面我们看看代码实现，首先看发布者、订阅者的接口定义：

观察者接口定义如下：

```ts
export default interface IObserver {
  update(subject: Subject): void
}
```

该接口只有一个 update 方法，用来在主题 Subject 状态改变时接收到通知。在稍后的例子中我们再展开，这里只配合说明接口定义。

发布者的接口：

```ts
/**
 * subject，表示发布者操作的接口
 */
export default interface ISubject {
  state: number
  //注册订阅
  register(observer: Observer): void
  //取消订阅
  remove(observer: Observer): void
  //通知订阅者
  notify(): void
}
```

在发布着操作的接口中，使用 register 方法注册观察者，使用 remove 方法把目标观察者从列表中移除，这两个方法的参数都是观察者实例对象，这个后面我们再具体定义。

发布者要想真正实现操作，还需要有一个发布者实现类（实现该接口），以完成 Pub/Sub 的核心原理。

```ts
import Observer from './Observer'
import Subject from './Subject'

export default class SubjectA implements Subject {
  //状态码
  public state: number
  //保存所有的订阅者
  private observers: Observer[] = []

  //注册
  public register(observer: Observer): void {
    const isExist = this.observers.indexOf(observer)
    if (isExist != -1) {
      return console.log('订阅者已经存在')
    }
    this.observers.push(observer)
    console.log('订阅者添加完成')
  }
  //移出
  public remove(observer: Observer): void {
    const observerIndex = this.observers.indexOf(observer)
    if (observerIndex === -1) {
      return console.log('要删除的订阅者不存在')
    }

    this.observers.splice(observerIndex, 1)
    console.log('订阅已删除')
  }
  public notify() {
    for (const observer of this.observers) {
      // console.log(this)
      observer.update(this)
    }
  }
  public setSteateToNotify(): void {
    this.state = Math.floor(Math.random() * 10)
    console.log(`state已经更新为: ${this.state}，开始通知所有观察者....`)
    this.notify()
  }
}
```

实现 ISubject 接口，就要实现该接口中的所有方法（这是接口实现的约定）。定一个 Observer 类型私有变量 observers，暂存所有的观察者。为了演示，在 register 方法和 remove 方法中只是做简单的 indexOf 判断，并不严谨。在 notify 方法中遍历观察者列表，通知各观察者。我们在方法 setSteateToNotify 中使用 Math 的 random 方法产生随机数，模拟状态的动态改变，并继续通知所有观察者。

下面，看下观察者的具体实现

```ts
import Observer from './Observer'
import Subject from './Subject'
import SubjectInstance from './SubjectA'

export default class ObserverB implements Observer {
  public update(subject: Subject): void {
    if (subject instanceof SubjectInstance && subject.state < 8) {
      console.log('--观察者B收到通知--')
    }
  }
}
```

在 Subject 的实现类中通过 notify 通知各个观察者，` observer.update(this)` ，如果满足条件就执行对应的逻辑。

已经有了观察者模式所需要的两个主要元素：发布者（卖家）和订阅者（各位客户），就具备了观察者模式的核心。另外就是我们前面也提到过，一旦发布者（商家）的状态发生改变，新的数据就会以某种形式推送给观察者。

下面我们来测试前面的几段代码：

```ts
import SubjectA from './SubjectA'
import ObserverA from './ObserverA'
import ObserverB from './ObserverB'
//发布者对象
const subject = new SubjectA()

//订阅者声明并增加到观察者列表
const observer1 = new ObserverA()
subject.register(observer1)

const observer2 = new ObserverB()
subject.register(observer2)
console.log('---------------')
//通知两次
subject.setSteateToNotify()
console.log('---------------')

subject.remove(observer2)

subject.setSteateToNotify()
```

得到的结果如下：

```
订阅者添加完成
订阅者添加完成
---------------
state 已经更新为: 6，开始通知所有观察者....
--观察者 A 收到通知--
--观察者 B 收到通知--
---------------
订阅已删除
state 已经更新为: 8，开始通知所有观察者....
--观察者 A 收到通知--
```

从测试代码看，我们给依赖列表增加两个观察者：A 和 B，调用 setSteateToNotify()，这两个观察者都能收到相应的通知，然后再从观察者列表中把 B 项移除，就只能有 A 有通知了。这个效果是我们期望的。

主题和观察者之间是一对多的关系。观察者依赖整个主题（卖家），因为要从主题那里获得通知。主题是有状态的，并且（主语是谁？）可以控制这些状态。

观察者模式定义了主题和观察者之间的松耦合关系，并且可以让两者进行交互，而不用太关注对方的细节，即"keep it simple"。观察者模式的缺点是， 如果过多地使用发布——订阅模式, 会增加维护的难度。

### 4.1.5 代理模式的实现

代理模式是一种结构性模式，作用是提供一个中间对象，为其他对象提供控制这个对象的能力。

代理模式在现实生活中有很多的示例，比如，信用卡是银行账号的代理，银行账号则是现金的代理，它们都有相同的功能（接口）————付款。使用信用卡付款可以让用户和商户都比较满意，因为他们都不用再随身携带大量的现金，无须担心出现现金丢失的情况，可以减少很多的麻烦。

电视剧《西游记》中也有代理模式的影子，在《计收猪八戒》中，孙悟空为了给高家“除妖”，扮成高翠兰的模样。从代理模式的角度来看，孙悟空把高翠兰的外貌和行为抽象成了接口，高翠兰和孙悟空都使用了这个接口，可以说孙悟空就是高翠兰的代理类。

下面我们用一个例子进行说明，一位男士想向他女朋友求婚，但由于各种原因不好意思说出口，就想请他的好朋友帮忙传话，UML 描述如图 4-7 所示。

![](./images/proxy.jpg)

图 4-7

先定义目标对象接口：

```ts
interface Subject {
  proposal(): void
}
```

有了对象接口，我们得看下实现类，也好明白想让目标对象到底做什么（被求婚）：

```ts
class RealSubject implements Subject {
  public proposal(): void {
    console.log('Darling, Can you marray me?')
  }
}
```

接下来定义传话人---代理类：

```ts
class Proxy implements Subject {
  private realSubject: RealSubject

  private chcekIsGoodFriend(): boolean {
    console.log("It's is checking if good friend")
    const r = Math.ceil(Math.random() * 10) //只有够意思才给你传话
    if (r > 6 || r == 6) {
      return true
    } else {
      return false
    }
  }

  private checkPromission() {
    console.log("It's checking the promission")
    if (this.chcekIsGoodFriend()) {
      return true
    }
    return false
  }

  public proposal(): void {
    if (this.checkPromission()) {
      this.realSubject.proposal()
    }
  }
}
```

首先，帮忙传话需要征得当事人的同意(checkPromission)；其次，这必须是一个靠谱的朋友(chcekIsGoodFriend)。

现在我们测试一下：

```ts
let realSubject = new RealSubject()

let subject: Subject = new Proxy(realSubject)

subject.proposal()
```

```
It's checking the promission
It's checking if good friend
Darling, Can you marray me?
Maybe she is willing
```

当然，ta 也许不同意呢。

```
It's checking the promission
It's checking if good friend
This friend is not worth be trusted.
This friend is unwilling to talk to his girlfriend
```

代理模式可以在不知不觉中访问到具体对象，即便是服务对象不存在或者不可用时。该模式同样也符合开闭原则，即便是在不需要修改服务对象或者客户端代码的情况下，还能创建新的代理。

但是不足的时，代码有变得臃肿的可能，新增加一种代理，就要增加一部分代码。另外，访问目标对象毕竟是通过了中间代理，还是有部分的延迟。

### 4.1.6 装饰者模式的实现

装饰者模式能够在不改变对象自身的前提下，在运行期给对象增加额外的功能。提到增强对象，我们的第一印象是使用继承扩展这个类，但是继承有如下两个问题：

- 继承是静态的，无法在运行时更改已有对象的行为。

- 在某些编译型语言中(如 Java)是不允许同时继承多个类的。

下面我们通过一个简单的示例进行说明，如图 4-8 所示。

![](./images/decorator.jpg)

图 4-8

首先，在接口中定义一个基本的 draw 方法：

```typescript
interface Shape {
  draw(): void
}
```

然后，用两个类实现该接口：

```ts
CircleShape implements Shape {

    public draw(): void {
       console.log("the draw method in class CircleShape");
    }
}

class RectangleShape implements Shape {

    public draw(): void {
        console.log("the draw method in class RectangleShape");
    }

}
```

接着，定义装饰类的基类：

```ts
class ShapeDecorator implements Shape {
  protected shape: Shape

  constructor(s: Shape) {
    this.shape = s
  }

  public draw() {
    this.shape.draw()
  }
}
```

protected 属性保存着 Shape 对象的引用，调用 draw 方法，就相当于调用 Shape 实例对象中的 draw 方法。接下来定义扩展后的装饰类：

```ts
class BlueShapeDecorator extends ShapeDecorator {
  public draw(): void {
    super.draw()
    this.setBGImage()
  }

  private setBGImage(): void {
    console.log('set background Image im BlueShapeDecorator')
  }
}

class GreenShapeDecorator extends ShapeDecorator {
  public draw(): void {
    super.draw()
    this.setBorder()
  }

  private setBorder(): void {
    console.log('set border in GreenShapeDecorator')
  }
}
```

“万事俱备，只欠东风”，下面进行测试：

```
let shape: Shape = new CircleShape();
let shape2: Shape = new RectangleShape();
const decorator1 = new BlueShapeDecorator(shape);
const decorator2 = new GreenShapeDecorator(shape2);
decorator1.draw();
console.log("---------------------");
decorator2.draw();
```

输出结果如下：

```
the drow method in class CircleShape
set background Image im BlueShapeDecorator
---
the drow method in class RectangleShape
set border in GreenShapeDecorator
```

装饰者和被装饰者相互对立，不是相互耦合。装饰者模式是继承的替代品，可以动态扩展一个实现类。

从上面的实例中大家也不难发现，想要扩展对象的行为，无需增加新的子类，并且是在运行时执行。再者就是可以使用装饰器对象组合几种操作，而不是在一个装饰器中增加多种操作，操作维护也更方便。但是在装饰器栈中想要删除某一个就显得不那么随意了。

## 4.2 前端开发人员必会的 V8 引擎

V8，这个词对很多前端程序员来说，既熟悉又陌生。熟悉的是它师出名门，它是由 Google 开发的高性能引擎。大名鼎鼎的 node.js 就是基于 V8 开发的，对前端开发比较友好的 Chrome 浏览器也有它的影子，甚至它还实现了前端的 ECMAScript 和 WebAssembly 规范。陌生的是它就像个黑盒子。

V8 可以运行在各个主流平台上，如 Windows、macOS、Linux 等。它既可以单独运行，也可以嵌入其他 C++程序中。

V8 是 WebKit 的子集。关于这个由来，我们需要简单介绍一下两次浏览器大战。

1993 年，浏览器 Mosaic 诞生，它是由 Marc Andreessen 领导的团队开发的，这就是后来大名鼎鼎的 Netscape（网景）浏览器（该浏览器只能显示静态的 HTML 元素，并不支持 JavaScript 和 CSS）。在当时，它十分受网民的欢迎，并且在世界范围内得到认可，市场占有率甚至达到 90%。然而，从 1995 年开始，事情变得有些不一样，这一年微软推出了 IE 浏览器，鉴于和 windows 捆绑的天然优势，IE 浏览器获得空前的成功，并逐渐取代了网景浏览器。至 2006 年年底，Netscape 的市场占有率已下降至不到 1%，并于 2008 年年初停止对网景浏览器的研发。网景公司从 1998 年开始成立 Mozilla 基金会，重新发力，研发 FireFox（火狐浏览器），并于 2004 年发布 FireFox 1.0 版，正式拉开第二次浏览器大战的序幕。Firefox 自推出以来，因为插件丰富、功能完善、兼容性更好，市场占有率不断攀升，而 IE 浏览器则因为自身原因，发展较慢。

浏览器之间的纷纷扰扰好像永无停歇。2003 年，苹果公司发布了 Safari 浏览器，并在 2005 年开源了该浏览器的内核，发起了一个叫作 WebKit 的开源项目。浏览器的春天来了。2008 年，Google 以 WebKit 为内核，创建了一个新的项目，叫作 Chromium（Chromium 本身也是一个浏览器），在这个项目的基础上发布了自己的浏览器 Chrome。Chromium 就像一个开源实验室，它会尝试较新的技术，待这些技术稳定之后，Chrome 才会把它们集成进来。

2013 年，Google 发布了 Blink 内核。Blink 内核其实是从 WebKit 复制出去独立运作的，因为 Google 和苹果公司之间出现了一些分歧。WebKit 将与 Chromium 相关的代码都删除了，同时，Blink 内核也删除了 chromium 相关的移植代码。Chrome 也是从 28 版本开始正式使用 WebKit。

### 4.2.1 WebKit 架构

WebKit 的大致架构如图 4-9 所示。

![](./images/webkit-arch.jpg)

图 4-9

WebKit 的一个比较明显的优势就是因为对规范良好的支持和很好的性能，它开始慢慢渗透到其他的浏览器，除了前面说的 Safari、Chrome，Chromium，甚至还 Opera（Blink,2013 年以后加入），Android 内置的浏览器，再到国产的傲游、360 极速、搜狗、QQ 浏览器，再到微软的 Edge 也加入了这个阵营。

图 4-9 中的虚线部分表示该模块在不同浏览器中使用的 WebKit 内核实现可能是不一样的。实线部分标记的模块表示它们基本上是共享的。

渲染引擎和 JavaScript 引擎是浏览器的两个核心部分，它们是相互合作的关系。为了防止个别同学将两者混淆，我们还是需要先解释一下。

WebKit 和 Chromium 中使用的 JavaScript 引擎是 V8。什么是 JavaScript 引擎？就是能够处理 JavaScript 代码并执行的运行环境，该引擎根据 JavaScript 提供的桥接接口提供访问 DOM 的能力。

> Safari 使用的是 Javascript Core，随着 WebKit 一起发布，老东家是苹果。V8 是有 Google 开发，实现了 ECMAScript 的 ECMA-262 规范。

渲染引擎将页面转变成可视化的图像结果，即渲染出来。渲染引擎主要包含 HTML 解析器、CSS 解释器、布局和 JavaScript 引擎，如图 4-10 所示。

![](./images/render.png)

图 4-10

- HTML 解析器：主要负责解释 HTML 元素，将 HTML 元素解析成 DOM。

- CSS 解释器：负责解析 CSS 文本，计算 DOM 中各元素的样式信息，为布局提供样式基础。

- 布局：把 DOM 信息和 CSS 信息结合起来，计算出它们的元素大小及位置信息，形成具有所有信息的表示模型。

- JavaScript 引擎：使用 JavaScript 既可以操作网页的内容，也可以修改 CSS 的信息。JavaScript 引擎能够解释 JavaScript 代码，可以操作网页内容及样式信息。

上面的表述较为抽象，下面我们用一张图来描述网页是如何呈现到用户眼前的，如图 4-11 所示。

![](./images/webkit-render.png)

图 4-11

> 虚线表示在渲染过程中该阶段可能依赖其他模块。比如在网页的下载过程中，需要用到网络和存储。

### 4.2.2 隐藏类和对象表示

虽然在 JavaScript 中没有明确定义类型，但是 V8 是在 C++的基础上开发完成的，它可以为 JavaScript 的对象构造类型信息。V8 借用了类和偏移位置的思想，将本来通过属性名匹配来访问属性值的方法进行了改进，使用类似 C++编译器的偏移位置机制来实现，这就是隐藏类。

隐藏类将对象分为不同的组，在同一个组的对象如果有相同的属性名和属性值，则会将这些属性名和对应的偏移位置保存在一个隐藏类中。
这样介绍还是比较抽象的，下面通过一个简单的例子进行解释，如图 4-12 所示。

![](./images/obj.png)

图 4-12

图 4-12 中创建了两个对象，即 p1 和 p2, 它们有相同的属性 name 和 age.，在 v8 中，它们被“安排”在同一个组中（即隐藏类中），并且这些属性有相同的偏移值。这样 p1 和 p2 可以共享这个类型信息。访问这些属性时就根据隐藏类的偏移值就可以知道它们的值继而进行访问。如果在某个 p1 运行时为其添加了新的属性，比如加入以下代码：

`p1.address='xi，an'`

那么 p1 对应的就是一个新的隐藏类。此操作同样使用 p2,如果新添加属性或方法，也会生成新的隐藏类。

在了解了隐藏类之后，下面看看代码是如何使用这些隐藏类来高效访问对象的属性的。我们用以下代码进行说明：

```js
function getName(person) {
  if (person && person.name) {
    return person.name
  }
}
```

访问的基本过程是这样的：首先获取隐藏类的地址，然后根据属性值查找偏移值，计算出属性的地址。遗憾的是，这个过程是比较耗时的。那么是否可以使用缓存机制呢？答案是肯定的，这套缓存机制叫作内联缓存(inline-cache)，主要思想就是将之前查找的结果缓存起来，避免方法和属性被存取时出现的因哈希表碰撞的问题。

> 散列表由于某种特殊情况，通过不同的 Key 可能访问到同一个地址，这种现象叫作碰撞（Collision）

在上面的 getName 方法中，如果要查找的 name 属性未缓存，则退回到前面，通过查找哈希表的方式进行查找，否则直接读取缓存。

### 4.2.3 对象在内存中的表示

JavaScript 中有 6 种基础类型，分别是 String、Number、 Boolean、Null、 Undefined 和 Symbol，这些类型的值都有固定的存储大小，往往保存在栈中，由系统自动分配存储空间，我们可以直接按值访问这部分的值。
其他类型为引用类型，比如对象，内存中分配的值就不是固定的。引用类型的变量值是保存在堆内存中的（堆是非结构化区域，堆中的对象占用分配的内存。这种分配是动态的，因为对象的大小、寿命、数量是未知的，所以需要在运行时分配和释放），这部分的值是不允许直接访问的。

```js
var name="houyw";
var age = 23;
var isMale = true;
var empty = null;

var person = {
 name: "houyw",
 age: 23,
 isMale: true;
}
```

变量在内存分配空间中的宏观观察如图 4-13 所示，具体的实现细节对我们来说是个黑盒，接下来我们将详细介绍具体的实现过程。
<img src="./images/stackAndHeap.png" style="zoom: 50%;" />

图 4-13

在默认情况下，JavaScript 对象会在堆上分配固定大小的空间存储内部属性，当预分配空间不足时（无空闲 slot），新增属性就会存储在 properties 中。而数字则存储在 element 中。如果 properties 和 elements 空间不足，则会创建一个更大的 FixedArray。为了便于说明问题，下面我们举例说明：

```js
var obj = {}
```

<img src="./images/jsobject-1.png" style="zoom:50%;" />

图 4-14

> V8 使用 map 结构来描述对象。map 结构可以理解为像 table 一样的描述结构。

通过对象字面量创建的空属性为对象默认分配 4 个内部空闲属性存储空间，如图 4-14 所示。

首先添加两个属性，空间存储情况就变成了图 4-15 所示：

```js
obj.name = 'houyw'

obj.age = 23
```

<img src="./images/jsobject-2.png" style="zoom:50%;" />

图 4-15

name 和 age 属性默认存储在对象的内部属性中。再添加两个数字属性，如图 4-16 所示。

```js
obj[0] = 'aaa'

obj[1] = 'bbb'
```

<img src="./images/jsobject-3.png" style="zoom:50%;" />

图 4-16

### 4.2.4 内存管理

v8 的内存管理只有两点：一是 V8 内存的划分，二是 V8 对 JavaScript 代码的垃圾回收。

V8 的内存划分如下：

- Zone 类：该类主要管理小块内存。当一块小内存被分配之后，不能被 Zone 回收，只能一次性回收 Zone 分配的所有小块内存。当一个过程需要很多内存时，Zone 将分配大量的内存，却又不能及时释放，结果就导致内存不足。

- 堆：管理 JavaScript 使用的数据、生成的代码和哈希表等。为方便实现垃圾回收，堆被分为了三部分，如图 4-17 所示。

  ![](./images/js-gc.png)

  图 4-17

  需要说明的是，年轻分代主要是为新创建的对象分配的内存，新创建的对象很容易被回收。为了方便垃圾回收，使用了复制的形式，将年轻分代分成两半，一半用来分配，另一半在回收的时候负责将之前保留的对象复制过来。年老分代主要是将年老分代的对象、指针等数据在使用内存较少时进行回收。而对于大对象空间来说，主要是用来为那些需要较多内存的大对象分配的，每个页面只能分配一个对象。

V8 使用了精简整理算法，标记那些还有引用关系的对象，回收没有被标记的对象，最后对这些对象进行整理和压缩。

垃圾回收机制是通过客户机或者程序代码是否可以触达此对象来判断对象是否存活的。可以这样理解可触达性（Reachability），即另一个对象是否可以获得它，如果可以，那么该对象所需的内存会被保留。

## 4.3 面试常问的宏任务和微任务

JavaScript 是单线程语言，单线程意味着 JavaScript 代码在执行时，只能有一个主线程来处理所有的任务。

单线程是有必要的，因为最初最主要的执行环境是浏览器。JavaScript 面对的是各种各样的操作 DOM、操作 CSS。如果是多线程执行，则很难在频繁操作的情况下保证一致性。即便保证了一致性，对性能也有较大的影响。

后来，为了实现多线程，引入了 webworker，但是该技术的使用却有诸多限制：

（1）新线程都受主线程的完全控制，不能独立执行，只能隶属于主线程的子线程；

（2）子线程没有操作 I/O 的权限。

尽管 js（JavaScript）是单线程的，但也是“非阻塞”的。js 是如何实现的呢？其实就是由和本小节相关联的 event loop（这里主要讨论浏览器版的实现）实现的。

脚本在执行时 ，js 引擎会解析代码，并将其中同步执行的代码依次加入执行栈中，从头开始执行。如果当前执行的是一个方法，那么 js 会向执行栈添加这个方法的执行环境，然后进入这个执行环境继续执行其中的代码。当这个执行环境中的代码执行完毕并返回结果后，js 会退出并销毁这个执行环境，回到上一个方法的执行环境。这个过程反复进行，直到执行栈中的代码全部执行完毕。如图 4-18 所示。

![](images/stack.png)

图 4-18

前面曾提到过，执行栈中存放的是同步代码，那么当异步代码执行时情况又是怎样的呢？既然是非阻塞的，又是通过什么机制保证的呢？这里不得不提到事件队列（Task Queue）。

熟悉 JavaScript 的都知道，对于异步请求，JavaScript 引擎可能并不会及时返还结果，而是将这个事件挂起，继续执行执行栈内的其他方法。当异步请求返还结果时，JavaScript 引擎会将这个事件推入另一个队列，叫作事件队列。放入该队列的事件并不会被立即执行，而是要等到执行栈内无可执行的方法，主线程处于空闲状态时，主线程才会去查找事件队列是否有任务。如果有，则主线程会取出第一位的事件，并把事件对应的回调函数放入执行栈中，然后执行。如此反复，就形成了无限执行的过程，这个过程被称为"事件循环(Event Loop)"。

上面的介绍十分有利于我们去了解宏任务和微任务。

前面介绍过，对于异步请求，JavaScript 引擎会把这个事件推入事件另一个队列中。实际上，JavaScript 引擎是根据异步事件的类型，把对应的异步事件推到对应的宏任务队列或者微任务队列中的。当主线程空闲时，主线程会先查看微任务队列中是否有事件，如果有就取出一条执行，如果没有，就从宏任务队列中取出一条执行。

现在，我们总结一下：**在同一次事件循环中，微任务的执行优先级会高于宏任务**。

下面来看一下代码的执行情况，看看在哪种情况下会被推入微任务队列，又在哪种情况下会被推入宏任务队列。

我们来看一个例子：

```js
console.log('console-1')

setTimeout(() => {
  console.log('settimeout-1')
  Promise.resolve().then(() => {
    console.log('promise-1')
  })
})

new Promise((resolve, reject) => {
  console.log('promise-2')
  resolve('promise-2-resolve')
}).then((data) => {
  console.log(data)
})

setTimeout(() => {
  console.log('settimeout-2')
})

console.log('console-2')
```

在浏览器中执行后，执行结果如下：

> console-1
> promise-2
> console-2
> promise-2-resolve
> settimeout-1
> promise-1
> settimeout-2

下面来看具体的执行过程，第 1 步执行的是全局的代码，会立即执行，这个没有什么疑问。结构如图 4-19 所示。

```js
console.log('console-1')
```

<img src="./images/task-1.png" style="zoom:50%;" />

图 4-19

打印如下执行结果：

`console-1`

第 2 步，执行 setTimeout 中的代码：

```js
setTimeout(() => {
  //这里定义为callback1
  console.log('settimeout-1')
  Promise.resolve().then(() => {
    console.log('promise-1')
  })
})
```

<img src="./images/task-2.png" style="zoom:50%;" />

图 4-20

因为 setTimeout 会被认为是宏任务，会被加入宏任务队列中。结果如 4-20 所示。所以打印结果仍然是：

> console-1

第 3 步，遇到 Promise，这个处理过程会有所不同：

```js
new Promise((resolve, reject) => {
  console.log('promise-2')
  resolve('promise-2-resolve')
}).then((data) => {
  //这里定义为callback2
  console.log(data)
})
```

<img src="./images/task-3.png" style="zoom:50%;" />

图 4-21

Promise 的构造函数是同步执行的，console 语句会立即执行。而 then 中的回调函数被认为是微任务，所以会被加入微任务队列中。如图 4-21 所示，打印结果如下：

> console-1
> promise-2

第 4 步：

```js
setTimeout(() => {
  //这里定义为callback3
  console.log('settimeout-2')
})
```

setTimeout 中的回调函数继续被推到宏任务队列中，如图 4-22 所示。

<img src="./images/task-4.png" style="zoom:50%;" />

图 4-22

执行结果和上次相比，没有发生变化：

> console-1
> promise-2

第 5 步，又是碰到 console 语句，这和第一步一样，执行栈中直接执行，见图 4-23。

```js
console.log('console-2')
```

![123](./images/task-5.png)

图 4-23

执行结果如下：

> console-1
> promise-2
>
> console-2

第 6 步：全局代码已执行完毕，此时 JavaScript 引擎会从微任务队列中取出一个微任务执行，我们要始终牢记，在一个事件循(Event Loop)环中，微任务队列中的代码执行的优先级要比宏任务中高，所以先从微任务的队列中取一条任务执行。

```js
console.log(data)
```

执行 then 中的回调函数，数据为 resolve 后的值，各栈的情况也变成了图 4-24 所示：

<img src="./images/task-6.png" style="zoom:50%;" />

图 4-24

执行结果如下，执行过后：

> console-1
>
> promise-2
> console-2
> promise-2-resolve

第 7 步：微任务队列中只有一个任务，执行完毕后，会从宏任务队列中取出一个任务（callback1）执行。

```js
console.log('settimeout-1')
Promise.resolve().then(() => {
  //这里定义为callback4
  console.log('promise-1')
})
```

<img src="./images/task-7.png" style="zoom:50%;" />

图 4-25

执行结果如下：

> console-1
>
> promise-2
>
> console-2
>
> promise-2-resolve
>
> settimeout-1

执行完同步任务后，又遇到另一个 Promise，异步执行完后又在微任务队列中加入一个任务，见图 4-25。

第 8 步：微任务队列中有任务，继续从该队列中取一个任务执行，如图 4-26 所示。

```js
console.log('promise-1')
```

![123](./images/task-8.png)

图 4-26

执行结果如下：

> console-1
>
> promise-2
>
> console-2
>
> promise-2-resolve
>
> settimeout-1
>
> promise-1

第 9 步：微任务队列中已为空，这时处理器开始从宏任务中调度一个任务执行，见图 4-27。

```js
console.log('settimeout-2')
```

<img src="./images/task-9.png" style="zoom:50%;" />

图 4-27

最终执行结果如下：

> console-1
> promise-2
> console-2
> promise-2-resolve
> settimeout-1
> promise-1
> settimeout-2

通过上面完整的分析过程，我们熟悉了宏任务、微任务的在一次事件循环中的执行情况。但是还有一种情况，不能不提，就是在 ES7 中引入的特性 async/await，该特性正是因为异步代码执行很像同步的，有更好的可读性而被广泛采用。

接下来我们就再看一个关于 async/await 的例子，看一下它的执行情况。

```js
setTimeout(() => console.log('setTimeout'))

async function main() {
  console.log('before resovle')
  await Promise.resolve()
  console.log('after resovle')
}
main()
console.log('global console')
```

在 async 函数体内，在 await 之前的代码都是同步执行的，可以理解为是给 Promise 构造函数传入的代码。在 await 之后的所有代码都是在 Promise.then 中的回调，会被推入微任务队列中。

> before resovle
>
> global console
>
> after resovle
>
> setTimeout

现在总结一下，在浏览器端，会被推入宏任务和微任务队列中的方法的回调如下：

宏任务：I/O、setTimeout、setInterval 和 requestAnimationFrame。

微任务：Promise.then、catch、 finally 和 await(后)。

该部分的内容相对比较抽象，希望读者可以结合更多的资料加深理解，以便更深入地了解 JavaScript 的执行过程。

## 4.4 流行的前端模块规范

模块化的热度一直未退，这是因为模块化可以有更好的代码约定，方便依赖关系的管理，规范前端开发规范，提高代码的可复用性，更重要的是，模块化是前端工程化的重要因素。工程化不是具体的某一项技术，而是一种较高的层次思维。前端工程化就是把前端项目作为一个完整的工程进行分析、组织、构建、优化，在相应的过程中进行优化配置，达到项目结构清晰、边界清晰，各开发人员分工明确、配合默契、提高开发效率的目的。

模块化的贯彻执行离不开相应的约定，即规范。这是能够进行模块化工作的重中之重，正所谓“不以规矩，不能成方圆”。

下面介绍目前流行的前端模块规范：Amd，Cmd,ES6 module 和 CommonJS。

### 4.4.1 AMD 和 RequireJS

Amd(Asynchronous Module Definition，异步模块定义）规范地址见链接<4-4>[https://github.com/amdjs/amdjs-api/wiki/AMD](https://github.com/amdjs/amdjs-api/wiki/AMD)。该规范通过 define 方法定义模块，通过 require 方法加载模块。

RequireJS 既想成为浏览器端的模块加载器，也想成为 Rhino/Node 等环境的模块加载器。

首先看一下 define 的 API 定义：

```js
define(id?, dependencies?, factory);
```

该方法接受 3 个参数，？表示可选项，定义模块时可以不用指定。第一个参数 id 表示该模块的 ID；第二个参数 dependencies 表示该模块所依赖的模块，该参数是一个数组，表示可以依赖多个模块；第三个参数 factory 是一个函数（也可以是对象），既然是函数，就可以有参数，那么参数是如何传递进来的呢？这时就需要看 dependencies 这个参数了，依赖模块的声明顺序和 factory 函数参数的声明顺序一致，示例代码如下：

```js
define([ 'service', 'jquery' ], function (service, $) {
    //业务
}
   return { }

})
```

依赖模块 service 和 jquery 在工厂方法执行前完成依赖注入，即依赖前置。

下面看一下完整的例子，以 AMD 规范的 requirejs 实现为例，首先在 HTML 文件中加入如下代码：

```js
<script data-main="js/main" src="js/libs/require.js"></script>
```

data-main 属性用于指定工程文件入口，在 main.js 中配置基础路径并进行模块声明：

```js
requirejs.config({
  //基础路径
  baseUrl: 'js/', //模块定义与模块路径映射
  paths: {
    message: 'modules/message',
    service: 'modules/service',
    jquery: 'libs/jquery-3.4.1',
  },
})

//引入模块

requirejs(['message'], function (msg) {
  msg.showMsg()
})
```

在 message 模块中引入依赖模块 service 和 jquery：

```js
define(['service', 'jquery'], function (service, $) {
  var name = 'front-end-complete-book'

  function showMsg() {
    $('body').css('background', 'gray')
    console.log(service.formatMsg() + ', from:' + name)
  }
  return { showMsg }
})
```

service 代码如下：

```js
define(function () {
  var msg = 'this is service module'
  function formatMsg() {
    return msg.toUpperCase()
  }
  return { formatMsg }
})
```

详细代码请参考本书的代码示例。

### 4.4.2 CMD 和 SeaJS

requirejs 在声明依赖的模块时会第一时间加载并执行。CMD（Common Module Definition，通用模块定义）规范地址见链接<4-5>[https://github.com/seajs/seajs/issues/242](https://github.com/seajs/seajs/issues/242)），它是另一种模块加载方案，和 amd 的不同之处在于：AMD 推崇依赖前置，提前执行。CMD 是就近依赖，延迟执行。

SeaJS 则专注于 Web 浏览器，同时可以通过 Node 扩展的方式在 Node 环境中运行。

> 扩展阅读：
>
> SeaJS 与 RequireJS 的不同参见链接<4-6>。[https://github.com/seajs/seajs/issues/277](https://github.com/seajs/seajs/issues/277)
>
> SeaJS 和 RequireJS 对比参见链接<4-7>。[https://www.douban.com/note/283566440/](https://www.douban.com/note/283566440/)
>
> SeaJS 规范文档参见链接<4-8>。[https://github.com/seajs/seajs/issues/242](https://github.com/seajs/seajs/issues/242)
>
> RequireJS 书写规范参见链接<4-9>。[https://github.com/seajs/seajs/issues/259](https://github.com/seajs/seajs/issues/259)

SeaJS 官方文档参见链接<4-10>，[https://github.com/seajs/seajs](https://github.com/seajs/seajs)

SeaJS 是 CMD 规范的实现，这里对规范部分不做详细的介绍，下面通过一个例子来说明。

用一般引入 js 文件的方法导入对 seajs 的支持：

```js
<script src="./js/libs/sea.js"></script>
```

> alias：当模块标识很长时，可以用这个简化，让文件的真实路径与调用标识分开。
>
> paths：当目录比较深，或需要跨目录调用模块时，可以使用 `paths` 来简化。

下面对 seajs 做基本的配置，并声明模块：

```js
seajs.config({
  charset: 'utf-8',
  base: './js/',
  alias: {
    jquery: 'libs/jquery-3.4.1',
    message: 'modules/message',
    service: 'modules/service',
  },
  paths: {},
})

seajs.use('./js/main.js')
```

使用 seajs.use 方法在页面中加载任意模块时， base 指定 seajs 的基础路径，该属性结合 alias 中的模块路径配置一起指向某一模块，这里需要注意路径的解析方法。

(1)相对标识

在http://example.com/modules/a.js 的 require 模块中('./b')引入 b 模块后（ps:这句看不懂），解析后的路径为 http://example.com/modules/b.js。

(2)顶级标识

顶级标识**不以点（"."）或斜线（"/"）开始**， 会相对 seajs 的 base 路径来解析。假如 base 路径为http://example.com/modules/libs/ ，则在某模块的 require('jquery/query-3.4.1')模块中引入 jquery 模块后，解析后的路径为 http://example.com/modules/libs/jquery/jquery-3.4.1.js。

(3)普通路径

在某个模块中引入模块 require('http://example.com/modules/a') 后，根据普通路径的解析规则，会相对当前页面进行解析。

继续回到 js/main.js 中，引入 message 模块：

```js
define(function (require, exports, module) {
  require('message').showMsg()
})
```

message 模块中的 serivce 模块和 jquery 模块如下：

```js
define(function (require, exports, module) {
  var service = require('service')
  var $ = require('jquery')
  var name = 'front-end-complete-book'

  function showMsg() {
    $('body').css('background', 'gray')
    console.log(service.formatMsg() + ', from:' + name)
  }
  exports.showMsg = showMsg
})
```

> 在 seajs 中引入 jquery 模块时需要进行简单的改造，因为 jquery 遵循 amd 规范，改造方式如下：
>
> define(function(){
>
> //jquery 源代码
>
> return jQuery.noConflict();
>
> });

完整的代码请参考源代码部分。（这个和上面的本书代码都在哪里提供？）

### 4.4.3 UMD

兼容 amd 和 CommonJS 规范的同时，还兼容全局引用的方式, 规范地址参见链接<4-11>[https://github.com/umdjs/umd](https://github.com/umdjs/umd)，常用写法如下：

```js
;(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    //AMD
    define(['jquery'], factory)
  } else if (typeof exports === 'object') {
    //Node, CommonJS支持
    module.exports = factory(require('jquery'))
  } else {
    //浏览器全局变量（root即window）
    root.returnExports = factory(root.jQuery)
  }
})(window, function ($) {
  function myFunc() {}
  //暴露公共方法
  return myFunc
})
```

### 4.4.4 ES6 module

ES6 在语言标准的层面上引入了 module，因而更加规范。ES6 module 首先在编译时加载需要的模块，使用 export 方法或者 export.default 方法暴露出方法、类、变量等，然后使用 import 方法导入需要的模块。

下面看一个例子。

定义 3 个模块：moduleA, moduleB 和 moduleC。其中，moduleA 为主模块，在浏览器中以 module 的方式导入。

```js
import name, { msg, person } from './moduleA.js'
```

在 moduleA 中可以导出各种数据结构：

```js
export var msg = 'msg from moduleA'

var obj = {
  name: 'hyw',
  age: 23,
}

export { obj as person }

export default name = 'module-A'
```

可以把这些数据输出到页面上，看看能否能被正确导入，如图 4-13 所示。（图号需要顺一下哈哈）

```js
<script type="module">
  import name, {(msg, person)} from "./moduleA.js";
  document.getElementById("test").innerHTML = msg + ",person name:" +
  person.name + ", module name is:" + name;
</script>
```

![](./images/ES6-1.png)

（谁）可以在浏览器 Chrome、Safari、Opera 或 Firefox 中正常执行。

另外，import 方法会返回 Promise 对象，因而也可以写成如下所示样式（这句没改好）：

```js
if (true) {
  import('./moduleB.js').then((res) => {
    console.log(res.obj.name + ', module name:' + res.default)
  })
}

Promise.all([import('./moduleB.js'), import('./moduleC.js')]).then(
  ([moduleB, moduleC]) => {
    console.log(
      moduleB.obj.name +
        ', module name:' +
        moduleB.default +
        ', another module is :' +
        moduleC.default
    )
  }
)
```

moduleC 模块中的代码较为简单，具体如下：

```js
export default name = 'module-C'
```

刷新浏览器，可以输出如下代码：

`

czn, module name:module-B
czn, module name:module-B, another module is :module-C

`

> 需要注意的是，ES6 module 输出的模块是引用的，即当原始值发生变化时，import 加载的值也会跟着改变。

### 4.4.5 CommonJS 规范

CommonJS 规范(官网参见链接<4-12>http://www.commonjs.org/) 是以在浏览器环境之外构建 JavaScript 生态系统为目标而产生的项目，比如在服务器和桌面环境(nw.js, electron)中。CommonJS 的前身叫作 Serverjs，是由 Mozilla 的工程师 Kevin Dangoor 于 2009 年 1 月创建的，同年正式更名为 CommonJS。

CommonJS 规范是为了解决 JavaScript 的作用域问题而产生的，它可以使每个模块在它自身的命名空间中执行。该规范的主要内容是，模块必须通过 module.exports 导出对外的变量或接口，通过 require 方法在运行时加载其他模块的输出到当前模块中。

> 扩展阅读：Google group 参见链接<4-13> [https://groups.google.com/forum/#!forum/commonjs](https://groups.google.com/forum/#!forum/commonjs)

下面看一个简单点的例子：

```js
module.exports = function (num) {
  if (typeof num != 'number') {
    return 0
  } else {
    return num * num
  }
}
```

该模块中暴露了一个方法，即计算一个数字的平方，在主文件引入这个模块：

```js
var square = require('./moduleA')
console.log(square(4))
```

> exports 和 module.exports 的关系如下：
>
> 1. module.exports 的初始值为一个空对象；
> 2. exports 是指向 module.exports 的引用；
> 3. require 方法返回的是 module.exports。

> 另外需要注意的是，CommonJS 模块输出的是值的拷贝，模块内部的变化不会影响已经导出的值。

## 4.5 编写程序的方法论：函数式编程

函数式编程是一种编程范式，它提供一种如何编写程序的方法论，主要思想是把运算过程尽量写成一系列嵌套的函数并进行调用。常见的编程范式有命令式编程、函数式编程、面向对象编程、指令式编程等。

在 JavaScript 中，函数作为一等公民可以在任何地方被定义，无论是在函数内还是在函数外。除此之外，它既可以被赋值给一个变量，也可以作为参数传递，或者作为一个返回值返回。

### 4.5.1 函数式编程的特性

下面通过两个简单的例子引入函数式编程。

1.对数组中的每个元素进行平方计算

```js
let array = [1, 2, 3, 4, 5, 6]

for (let i = 0, iLen = array.length; i < iLen; i++) {
  array[i] = Math.pow(array[i], 2)
}
```

这是一个典型的命令式编程，需要一步一步说明应如何实现功能。这样的写法显然有些过时了，下面进行简单的改造：

```js
;[1, 2, 3, 4, 5, 6].map((num) => Math.pow(num, 2))
```

使用 map 函数之后，一方面代码逻辑简化了许多，另一方面引入了函数式编程。

结合上面的例子可总结如下：

> **命令式编程**是告诉计算机具体工作步骤。
>
> **声明式编程**是将程序的描述与求值分离，关注如何用表达式描述程序逻辑。

再来看一个对变量进行加一的例子，借此引入函数式编程的第二个特性：

```js
let counter = 0

function increment() {
  return ++counter
}
```

这个 increment 方法是有一定缺陷的，该方法对其他作用域有副作用（side-effect），会影响其他作用域变量的值，所以需要进行适当的改造：

```js
let increment = (counter) => ++counter
```

改造后，函数内的修改只能影响传入的参数，不会对影响其他作用域的值。

需要知道的是，改造后的 increate 函数是一个纯函数，纯函数有以下特性：

1.函数返回值仅取决于输入参数。 2.不能造成超出作用域外的状态变化。

以上两个例子介绍了函数式编程的两个基本特性：声明式、纯函数行。函数式编程旨在帮助我们编写干净的、模块化的、可测试的、简洁的代码，提高代码的无状态性和不变性。它遵循以下原则：

声明式（Declarative）
纯函数（Pure Function）
数据不可变性（Immutablity）

### 4.5.2 函数式编程的优点

函数式编程的优点可总结如下：

1.把任务分解成简单的函数

假设我们要在页面上根据学号显示学生的姓名、年级。在拿到题目后，脑子里立刻产生的代码可能是这样的:

```js
function showStudent(stuNum){
  //stub（这是啥），假设有这样一个store，可以根据学号获得学生对象
  var student = store.get(stuNum);
  if(student){
    document.querySelector("${target}").innerHTML = '${student.name},${student.grade}'
  }
}
showStudent（'011526'）
```

这个函数从功能上看是没有问题的，能够满足功能要求。但有两个问题比较突出：
第一，代码是强耦合的，测试会变得较为复杂；
第二，代码无法复用。这与函数编程的组合思想相冲突。
下面给它做个“手术”：

```js
var find = curry(function (store, stuNum) {
  var student = store.get(stuNum)
  if (student != null) {
    return student
  }
})

var objToString = function (student) {
  return `${student.name},${student.grade}`
}

var append = curry(function (target, info) {
  document.querySelector(target).innerHTML = info
})

var showStudent = compose(append('target_id', objToString, find(store)))

showStudent('222')
```

这时你可能会想，curry 函数和 compose 函数是什么样子的呢？先不要着急，在稍后介绍的函数式编程基础部分会详细介绍这两个方法。"手术后"的代码变化较大，由刚开始的 1 个函数变成了 4 个，各个函数的职责也更加清晰，find 方法负责从持久化对象中获得学生对象，objToString 方法负责输出学生信息，append 方法负责把信息添加到目标对象上，compose 方法负责把各个方法组合起来。

> 提示：职责单一不仅是函数式编程的重要特点，也是软件设计 SOLID 中非常重要的一个原则。

2.接近自然语言，方便理解

函数式编程的自由度较高，可以实现接近自然语言的代码。比如要计算一个数学表达式 (2+4)\*15+72 的值，翻译成代码语句可能要编程下面这样：

```js
add(multiply(sum(2, 4), 15), 27)
```

这样的实现方式是不是更容易理解了。

3.更容易的代码管理

函数式编程的原则之一是纯函数，状态不受外部因素的影响，同时不会改变外部状态。只要传入的参数相同，得到的结果一定是相同的（幂等）。也就是说，每个函数都是独立的，测试会变得非常轻松。

### 4.5.3 函数式编程的原则及实践

前文介绍了函数式编程的诸多好处，那么如何才能编写出好的函数式代码呢？下面讲解函数式编程的基础。

1.高阶函数（higher-order function，HOF）

在数学和计算机科学中，高阶函数至少要满足下列一个条件：

> （1）可接收一个或多个函数作为输入；
>
> （2）返回一个函数。

首先编写一个过滤器的高阶函数：

```js
const filter = (predicate, xs) => xs.filter(predicate)
```

然后增加一个类型判断辅助函数：

```js
const is = (type) => (x) => Object(x) instanceof type
```

测试一下：

```js
filter(is(Number), [0, '1', 2, null, 'name', '33'])
```

输出[0, 2]，这是我们想要的结果。

2.柯里化(Currying)

柯里化是将多个参数的函数(多元函数) 转换为一元函数的过程。每当函数被调用时，它仅仅接收一个参数并且返回带有一个参数的函数，直到所有的参数传递完毕。

下面定义一个柯里化求值函数 curriedSum：

```js
const curriedSum = (a) => (b) => a + b
```

简单看一下这个函数的执行过程，第一次调用：

```
curriedSum(16)
```

返回：

```js
;(b) => 16 + b
```

继续调用：

```js
curriedSum(16)(24)
```

最后得到结果：40

3.闭包(Closure)

闭包是指有权访问另一个函数作用域中的变量的函数。闭包形成的最常见的方式是在一个函数内创建另一个函数，通过另一个函数访问这个函数的局部变量。

总体来说，闭包有 3 个特性：  
（1）函数嵌套；  
（2）内部函数可以引用外部函数的参数、变量和函数表达式；
（3）闭包不会被垃圾回收机制回收，常驻内存。

先声明一个简单的闭包形式：

```js
function init() {
  var name = '首席coder'
  var innerCount = 0
  function displayName() {
    innerCount++
    alert(name)
  }
  function getCount() {
    alert(innerCount)
  }
  displayName()
  displayName()
  getCount() //2
}
```

方法 displayName 声明在 init 方法内形成闭包。通过两次调用 displayName 方法将 innerCount 增加，通过显示的值可以看出，闭包涉及的变量会常驻内存，不会被释放。所以说闭包数量过多时会导致内存泄漏。

4.函数组合(Function Composition)

函数组合是函数式编程中非常重要的部分，函数式编程崇尚细粒度的函数实现，细粒度实现后，应如何把这些函数组织起来有效的工作呢？

这就是函数的组合功能，先来看一下函数组合的雏形：

```js
const compose = (f, g) => (a) => f(g(a))
```

compose 中接收了两个函数（为了简单起见，这里对参数进行类型校验，默认为函数类型）作为参数，对传进来的参数先用函数进行运算，再把运算结果作为 f 函数的入参继续运算。

有了函数组合之后，还需要定义规则，说明想要实现的功能。比如，想要把数字四舍五入后并转换为字符串，就需要两个方法，一个是 Math 的 round 方法，另一个是 toString 方法。下面把这两个方法整合成一个方法 floorAndToString：

```js
const floorAndToString = compose((val) => val.toString(), Math.round)
```

测试结果如下：

```js
floorAndToString(121.212121) // '121'
floorAndToString(121.512121) // '122'
```

测试顺利通过。至此，函数式编程中最重要的原则已全部介绍完毕，再来看 4.5.2 节中优化后的代码，是不是变得更容易理解了？

5.其他原则

函数式编程还有其他原则，限于篇幅这里不再详细介绍，感兴趣的读者可以自行查阅：

    幂等 （Idempotent)

偏应用函数（Partial Application)

断言 （Predicate)

自动柯里化（Auto Currying)

> 笔者整理的相关内容参见链接<4-14>。http://www.houyuewei.cn/2018/08/23/js-func-program-term

## 4.6 实践：状态原理解析

前端技术的发展日新月异，经过几年的沉淀，逐渐形成了以 React、Vue、Angular 为“领袖”的三大开发框架和各自的全家桶，带来了全新的开发体验。

随着页面复杂度的升级，对应的 localstorage、vuex、redux 和 mobx 等数据存储和管理方案也渐渐复现。所以对状态管理的原理进行一定的了解还是很有必要的，了解基本原理也方便理解其他的管理库。

下面通过一个简单的例子，一步一步解析一下 state 是如何工作的。

基本的原理图如图 4-14 所示。

![](./images/state-1.png)

数据流向有单向（如 vuex、redux）和双向（mobx）之分，与双向数据流相比，单向数据流更具可维护性，所以以此模型进行说明。

事件默认都是从 UI 页面开始发起的，dispatch 一个 action，也就是说，在单向数据流模型中，状态的改变都是以触发 action 作为入口条件的，在 action 中 commit（提交）一个 mutation 来更新 state 中的数据，状态改变会自动更新页面。

阐述完状态的基本原理后，下面实现一个如图 4-15 所示的页面（数据不持久化）。

![](./images/state-2.png)

已完成任务部分（List 组件）和右侧已完成任务统计（count 组件）部分分别对应两个组件。

先来看 View 组件，定义一个 component 的基类：

```js
export default class Component {
  constructor(props = {}) {
    // 继承该类的组件应该实现该方法，用来渲染组件
    this.render = this.render || function () {}

    if (props.store instanceof Store) {
      props.store.events.subscribe('stateChange', () => self.render())
    }

    //如果element（用中文）元素，就把该元素设置为元素挂载节点
    if (props.hasOwnProperty('element')) {
      this.element = props.element
    }
  }
}
```

我们约定各子组件要实现的 render 方法，然后在 render 方法中实现 DOM 结构。this.element 指定 DOM 结构的挂载位置。为了实现页面的自动更新，子组件借助发布/订阅模式订阅 stateChange 事件。在 store 中，当 state 中的数据更新时，会发布该事件，子组件收到通知后会重新渲染。该行为类似 React 中的 setState 中的效果。

再看一下组件的具体实现，Count.js（大小写确认一下，代码中没看到？）：

```js
import Component from '../lib/component.js'
import store from '../store/index.js'
import _ from '../lib/utils.js'

export default class Count extends Component {
  constructor() {
    super({
      store,
      element: _.$('.js-count'), //获得dom节点
    })
  }

  render() {
    let emoji = store.state.items.length > 0 ? '🙌' : '😢'

    this.element.innerHTML = `
            <small>你今天已完成</small>
            <span>${store.state.items.length}</span>
            <small>条任务 ${emoji}</small>
        `
  }
}
```

子组件中通过调用父组件的构造函数完成了事件订阅。

```js
export default class PubSub {
  constructor() {
    this.events = {}
  }

  /**
   * 订阅事件，并注册回调方法
   */
  subscribe(event, callback) {
    let self = this

    if (!self.events.hasOwnProperty(event)) {
      self.events[event] = []
    }

    return self.events[event].push(callback)
  }
}
```

下面梳理一下 store 的情况，Store 由 Action、Mutation 和 State 三部分组成。action 用来标识每个请求，它是触发 state 变化的唯一因素。mutation 类似于事件，每个 mutation 都有一个事件类型和回调函数，这个回调函数是进行状态改变的地方，可接收 state 和 payload 作为参数。

```js
export default new Store({
  actions,
  mutations,
  state,
})
```

store.js

```js
export default class Store {
  constructor(params) {
    let self = this
    //定义actions（这里有s，上面的没有，是否需要统一）、mutations和state
    //在初始化中，需要把action和mutation都初始化进来
    self.actions = {}
    self.mutations = {}
    self.state = {}

    // A status enum to set during actions and mutations
    self.status = 'resting'

    // 初始化发布——订阅模型
    self.events = new PubSub()

    //如果传入actions，就使用传入的actions
    if (params.hasOwnProperty('actions')) {
      self.actions = params.actions
    }

    if (params.hasOwnProperty('mutations')) {
      self.mutations = params.mutations
    }

    //对state的值设置拦截
    self.state = new Proxy(params.state || {}, {
      set: function (state, key, value) {
        state[key] = value
        // 发布 stateChange通知
        self.events.publish('stateChange', self.state)

        return true
      },
    })
  }
}
```

把 store 中的 state 设置成全局 state 数据模型的代理，这是因为我们要让 state 扮成状态机的角色，state 的变化引发页面的渲染，此时 Proxy 是一个很好的选择。

> 对 Proxy 不是很熟悉的读者可以参见链接<4-15>。https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy

在 Proxy 的 set 钩子里，一旦 state 发生变化，就会发布 stateChange 通知各个子组件。

store 又是如何分发 action 的呢？我们来探究一下，看看 store 中定义的 dispatch 函数，它可接收 type 类型和数据对象：

```js
dispatch(actionKey, payload) {

    // 校验action（注意是否为actions）是否存在
    if (typeof self.actions[actionKey] !== "function") {
      console.error(`Action "${actionKey} doesn't exist.`);
      return false;
    }

    // 分组显示action信息
    console.groupCollapsed(`ACTION: ${actionKey}`);

    // 设置action，说明我们正在dispatch（中译文）一个action
    self.status = "action";

    //调用actions
    self.actions[actionKey](self, payload);

    // Close our console group to keep things nice and neat
    console.groupEnd();

    return true;
  }
```

在 view 组件中，通过下面的代码

```js
store.dispatch(types.ADDITEM, value)
```

派发 action，这里需要为每个 action 指定类型，使用该字段为区分是什么类型的 action。因为所有的 action 在 store 初始化时已经注入，所以只需根据 action type 来判断对应的 action 是否存在即可。

action.js

```js
export default {
  addItem(context, payload) {
    context.commit(types.ADDITEM, payload)
  },
  clearItem(context, payload) {
    context.commit(types.CLEARITEM, payload)
  },
}
```

如果能找到对应的 action，则立即执行。注意：

```js
self.actions[actionKey](self, payload)
```

因为 action 在执行时需要把 self 传进来，所以 action 中方法的第一个参数还是指向 store 的。store 继续 commit：

```js
commit(mutationKey, payload) {

    // 校验mutation是否存在
    if (typeof .mutations[mutationKey] !== "function") {
      console.log(`Mutation "${mutationKey}" doesn't exist`);
      return false;
    }
    ...
    // 创建一个新的state，并将新的值附在state上
    let newState = this.mutations[mutationKey](this.state, payload);

    // 替换旧的state值
    this.state = Object.assign(this.state, newState);

    return true;
  }
```

commit 中的 mutationKey 是从 action 顺延下来的。与 action 的处理过程相似，对应的 mutation 也是初始化加载，需要根据 key 值处理对应的 mutation：

mutation.js

```js
export default {
  addItem(state, payload) {
    state.items.push(payload)

    return state
  },
  clearItem(state, payload) {
    state.items.splice(payload.index, 1)

    return state
  },
}
```

state 带对应 addItem 类型的 mutation，在 state 数组中 push 一条记录。至此，我们就了解了 state 的状态机是如何工作的，Proxy 的 set 钩子是如何被触发的，子组件是在何种情况下重新工作的。

一切都变得顺理成章。现在可以启动一下示例代码或者按照这个思路重新实现一遍，看看效果是怎样的。
