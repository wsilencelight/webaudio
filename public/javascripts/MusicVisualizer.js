//接收一个object
function MusicVisualizer(obj) {
    //当前正在播放的buffersource节点
    this.source = null  
    //点击次数
    this.count = 0      
     //创建分析节点
    this.analyser = MusicVisualizer.ac.createAnalyser()  

    this.size = obj.size 
    //fftSize = size * 2
    this.analyser.fftSize = this.size * 2   

    this.gainNode = MusicVisualizer.ac[MusicVisualizer.ac.createGain ? "createGain" : "createGainNode"]() //控制音量节点
    //把gainNode连接到ac.destination
    this.gainNode.connect(MusicVisualizer.ac.destination) 
    //将分析节点连到gainNode，这样就间接连接到destiantion
    this.analyser.connect(this.gainNode)
    //ajax请求资源
    this.xhr = new XMLHttpRequest()
    //可视化
    this.visualizer = obj.visualizer
    //这是下面的函数，相当于执行一次
    this.visualize()

}

MusicVisualizer.ac = new (window.AudioContext||window.webkitAudioContext)()


//加载音频资源
MusicVisualizer.prototype.load = function(url, callback) {
    //终止上次请求
    this.xhr.abort()
    this.xhr.open("GET", url)
    this.xhr.responseType = "arraybuffer"
    var self = this
    //绑定onload事件
    this.xhr.onload = function() {
        callback(self.xhr.response)
    }
    this.xhr.send()
}

//解码音频资源
MusicVisualizer.prototype.decode = function(arraybuffer, callback) {
    MusicVisualizer.ac.decodeAudioData(arraybuffer, function(buffer) {
        callback(buffer)
    },
    function(err) {
        console.log(err)
    })
}
//停止播放
MusicVisualizer.prototype.stop = function() {
    this.source[this.source.stop ? "stop" : "noteOff"]()
}
//播放音频资源
MusicVisualizer.prototype.play = function(url) {
    //用以计数,不要用count++
    var n = ++this.count
    var self = this
    //终止上次播放，如果this,source属性存在的话,这里stop单独定义一个方法
    this.source && this.stop()
    this.load(url, function(arraybuffer) {
       
        //这个buffer就是上面decode函数中解码成功的音频数据
        self.decode(arraybuffer, buffer => {
            var bs = MusicVisualizer.ac.createBufferSource()
            bs.connect(self.analyser)
            bs.buffer = buffer
            //播放
            if(n != self.count)
                return
            bs[bs.start ? "start" : "noteOn"](0)
            self.source = bs
        },
        error => {
            console.log(error)
        })
    })
}


//音量控制
MusicVisualizer.prototype.changeVolume = function(percent) {
    this.gainNode.gain.value = percent * percent
}

MusicVisualizer.prototype.visualize = function() {
     //8 位无符号整数值的类型化数组 长度就是sstsize的一般,就是frequencyBinCount这个属性
     let arr = new Uint8Array(this.analyser.frequencyBinCount)
     // console.log(arr)
     
     // requestAnimationFrame传入的参数是回调函数，这是相当于在不停调用自己?
     requestAnimationFrame = window.requestAnimationFrame
     let self = this
     function v() {
         //将分析的数据赋值到数组里
         self.analyser.getByteFrequencyData(arr)
         //数据可视化
         self.visualizer(arr)
         requestAnimationFrame(v)
     }
     requestAnimationFrame(v)
}