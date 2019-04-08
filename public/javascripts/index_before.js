function $(name) {
    return document.querySelectorAll(name)
}

var lis = $("#list li")
for(let i = 0; i < lis.length; i++) {
    lis[i].onclick = () => {
        for(let j = 0; j < lis.length; j++) {
            lis[j].className = " "
        }
        // 这里为什么this不行呢
        lis[i].className = "selected"
        load('../media/' + lis[i].title)
    }
}
//ajax请求音频资源
var xhr = new XMLHttpRequest();
//audioContext,解码音频
var ac = new (window.AudioContext||window.webkitAudioContext)();
//gainnode控制音量
var gainNode = ac[ac.createGain ? "createGain" : "createGainNode"]();
//ac.destination就像一个database
gainNode.connect(ac.destination)
//声明分析器
var analyser = ac.createAnalyser()
//音乐真实数据长度
var size = 128
analyser.sstSize = size * 2 
analyser.connect(gainNode)
//用以判断是否有音乐在播放
var source = null
var sum = 0
//获取box
var box = $("#box")[0]
var width = 0
var height = 0
//创建canvas
var canvas = document.createElement("canvas")
box.appendChild(canvas)
//创建一个画布环境
var ctx = canvas.getContext("2d")
//创建点数组
var Dots = []
//返回m~n之间的一个整数
const random = (m, n) => {
    return Math.round(Math.random() * (n - m) + m)
}
function getDots() {
    Dots = []
    for(let i = 0; i < size; i++) {
        let x = random(0, width)
        let y = random(0, height)
        let color = "rgb("+random(0, 255)+","+random(0, 255)+", "+random(0, 255)+")"
        Dots.push({
            x: x,
            y: y,
            color: color
        })
    }
}

//-------------------------------------------------
//我发现以下这种写法有点问题,初始化会有canvas但是
//改变大小之后canvas却不变化,显然是window.onsize没有起
//正确作用,但是也没找到不起作用的原因
//-------------------------------------------------
//设置canvas的高和宽,并能动态变化
//当窗口改变的时候就执行函数改变值

var line
function resize() {
    // console.log("jsdjks")
    width = box.clientWidth 
    height = box.clientHeight
    canvas.height = height
    canvas.width = width
    // 创建纵向线性渐变
    line = ctx.createLinearGradient(0, 0, 0, height)
    // 添加渐变色
    line.addColorStop(0, "red")
    line.addColorStop(0.5, "green")
    line.addColorStop(1, "yellow")
    getDots()
}
resize()
//先调用一次,不然最开始的时候是没有值的
window.onresize = resize
//通过这个type来判断
draw.type = "column"
//绘制柱状图/圆点图
function draw(arr) {
    //清空上一次绘制
    ctx.clearRect(0, 0, width, height)
    let w = width / size
    //默认线性
    ctx.fillStyle = line
    for(let i = 0; i < size; i++) {
        //绘制柱状
        if(draw.type == "column") {
            var h = arr[i] / 256 * height
            ctx.fillRect(w * i, height - h, w * 0.6, h)
            
        }
        //绘制点状
        else if(draw.type == "dot") {
            //重置当前路径,用stroke绘制时
            ctx.beginPath()
            let o = Dots[i]
            let r = arr[i] / 256 * 50
            //创建一个圆形
            ctx.arc(o.x, o.y, r, 0, Math.PI * 2, true)
            //创建渐变
            let g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r)
            g.addColorStop(0, "red")
            g.addColorStop(1, o.color)
            ctx.fillStyle = g
            ctx.fill()
            // ctx.strokeStyle = "red"
            // //绘制
            // ctx.stroke()
        }
        
    }
}


//改变点状图/柱状图按钮的样式
var types = $("#type li")
for(let i = 0; i < types.length; i++) {
    types[i].onclick = () => {
        for(let j = 0; j < types.length; j++) {
            types[j].className = ""
        }
        types[i].className = "selected"
        //返回data-type的属性值
        draw.type = types[i].getAttribute("data-type")
        // console.log(draw.type)
    }
}

function load(url) {
    var num = ++sum
    source && source[source.stop ? "stop" : "noteOff"]()
    xhr.abort()
    xhr.open("GET", url)
    xhr.responseType = 'arraybuffer'
    xhr.onload = () => {
        ac.decodeAudioData(xhr.response, buffer => {
            let bufferSource = ac.createBufferSource();
            bufferSource.buffer = buffer
            bufferSource.connect(analyser)
            //上面analyser已经连接了gainNode,这里又连接了bufferSource,所以gainNode无需再连接
            // bufferSource.connect(gainNode)

            // gainNode已经连接destination,所以无需重复连接
            // bufferSource.connect(ac.destination)

            //在播放前判断相不相等即可
            if(sum != num) {
                return
            }
            // 播放音乐
            bufferSource[bufferSource.start ? "start" : "noteOn"](0)
            source = bufferSource
            
        },
        err => {
            console.log(err)
        })
        
    }
    xhr.send()
} 

//将音乐数据可视化
function visualizer() {
    //8 位无符号整数值的类型化数组 长度就是sstsize的一般,就是frequencyBinCount这个属性
    let arr = new Uint8Array(analyser.frequencyBinCount)
    // console.log(arr)
    
    // requestAnimationFrame传入的参数是回调函数，这是相当于在不停调用自己?
    requestAnimationFrame = window.requestAnimationFrame
    function v() {
        //将分析的数据赋值到数组里
        analyser.getByteFrequencyData(arr)
        draw(arr)
        requestAnimationFrame(v)
    }
    requestAnimationFrame(v)
}
visualizer()

//调节音量
function changeVolume(percent) {
    gainNode.gain.value = percent * percent
}

//这里用箭头函数为啥会出错呢
$("#volume")[0].onchange = function(){
    changeVolume(this.value/this.max)
}
//调用这个方法S
$("#volume")[0].onchange();