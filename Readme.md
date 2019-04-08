## 环境搭建
- 1.express一个文件夹，express -e xxx（-e是另一种模板）
- 2.进入文件夹安装一个自动监听工具npm install -g supervisor，supervisor和nodemon一样都是用以监听的工具
- 3.别忘了npm init初始化一下

## 内容
- 1. 首先我们使用supervisor来监控实现自动刷新
- 2. 在index.js中使用ajax的xmlHttpRequst对象来异步请求音频数据

## AudioContext
- 1. 包含各个AudioNode对象以及他们联系的对象，可以理解为audio上下文对象。绝大所属情况下，一个document中只有一个AudioCaontext创建 var ac = new window.AudioContext();
- 2. 属性：destination:AudioDestinationNode对象，所有的音频输出聚集地，相当于音频的硬件，所有的AudioContext从创建开始到当前的时间(秒)
- 3. 方法：
- - 1. decodeAudioData(arrayBuffer, succ(buffer),err),异步解码包含arrayBuffer中的音频数据，succ是一个解码成功的回调函数
- - 2.creatBufferSource(),创建AudioBufferSourceNode对象
- - 3.creatAnalyser(),创建AnalyserNode对象
- - 4.createGain()/createGainNode(),创建GainNode对象
## 4.AudioBufferSourceNode对象
- 1. 表示内存中的一段音频资源，其音频数据存在于AudioBuffer中(其buffer属性)
- 2. 创建：var buffersource = ac.createBufferSource()
- 3. 方法:start/noteOn(when = ac.currentTime, offset=0,duration=buffer.duration-offset),开始播放音频，when是何时，offset是偏移量，相当于第几秒，duration:播放几秒
- 4. 方法：stop/noteOff(when=ac.currentTime),结束播放音频 

## 5.GainNode对象
- 1. 改变音频音量的对象，会改变通过它的音频数据所有的sample frame的信号强度
- 2. 创建：var gainNode = ac.createGain()/ac.createGainNode()

## 6.AnalyserNode
- 1. 音频分析对象，它能实时的分析音频资源的频域和时域信息，但不会对音频流做任何分析
- 2. 创建 var analyser = ac.createAnalyser()
## 可能遇到的问题
- 1. 点击一首歌，正常播放，再点击另一首歌发现两首歌都播放
- - 解决办法：可以定义一个全部变量source为null，当执行xhr.onload以后就让这个变量等于bufferSource,那么自然如果请求到值则source不为空，不为空的时候就将调用stop方法，其实这个时候的source已经是一个bufferSource对象了，自然可以调用
- 2. 但是这个时候发现当我点击第一首在还没播放之前马上点第二首，这样两首音乐都会播放，可以发现这是因为source还没赋值成bufferSource时就已经进行第二首歌的加载，自然这个时候不会执行stop
- - 解决办法：这个解决办法很巧妙，用到了闭包的原理，每个load都会创建一个n，这个n因为内部函数onload调用，所以形成闭包，在函数执行完之后该n变量仍存在（且值一直为当时的值）onload的环境里面，所以当onload执行时，n就可能不等于现在的count(因为count一直在增长)。其实导致count和n不相等的原因就是音频加载的速度远远比不上运行三次函数的速度(不包括加载的部分)