
function $(name) {
    return document.querySelectorAll(name)
}

//音乐真实数据长度
var size = 128
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
var mv = new MusicVisualizer({
    size: size,
    visualizer: draw

})

var lis = $("#list li")
for(let i = 0; i < lis.length; i++) {
    lis[i].onclick = () => {
        for(let j = 0; j < lis.length; j++) {
            lis[j].className = " "
        }
        // 这里为什么this不行呢
        lis[i].className = "selected"
        mv.play('../media/' + lis[i].title)
    }
}

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





//这里用箭头函数为啥会出错呢
$("#volume")[0].onchange = function(){
    mv.changeVolume(this.value/this.max)
}
//调用这个方法S
$("#volume")[0].onchange();