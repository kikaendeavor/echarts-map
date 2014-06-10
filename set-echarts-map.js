!function () {
    function EchartHelper(container, option) {
        var me = this,
            option = option || {};
        $.extend(me.option, option);
        me.container = container;
    }

    EchartHelper.prototype = {
        getDataInterval: '',
        myChart: '',
        option:{
            backgroundColor:'#fff',
            color:['#fc0','#fc0'],   //[省会城市颜色,目的地光圈效果颜色]
            title:{
                text:'单日资金流向图',
                subtext: mapDate(),
                backgroundColor:'#edf5ff',
                padding:[10,30,10,30],
                x:'left',
                y: 30,
                itemGap: 5,
                textStyle:{
                    color:'#333',
                    fontSize:16
                },
                subtextStyle:{
                    color:'#333'
                }
            },
            dataRange: {
                x : '-100',
                min: 0,
                max: 100,
                color: ['#d9effb','#f0fafe','#e7f6ff','#d9effb'],  //100~75,75~50,50~25,25~0
                text:['High','Low'],           // 文本，默认为数值文本
                calculable : false
            },
            tooltip:{
                trigger:'item',
                formatter:function (v) {
                    return v[1].replace(':', ' > ');
                }
            },
            legend:{data:[]},
            series:[
                {
                    name:'全国',
                    type:'map',
                    roam:false,
                    hoverable:false,
                    mapType:'china',
                    itemStyle:{
                        normal:{
                            borderColor:'#8ec8ee',
                            borderWidth:1,
                            areaStyle:{
                                color:'#fff'
                            },
                            lineStyle:{
                                color:'#e6551d',
                                type:'dashed',
                                width:'1'
                            }
                        }
                    },
                    data:[
                        {name: '北京', value: 100},
                        {name: '上海', value: 100},
                        {name: '天津', value: 100},
                        {name: '重庆', value: 100},
                        {name: '安徽', value: 100},
                        {name: '福建', value: 0},
                        {name: '甘肃', value: 100},
                        {name: '广东', value: 100},
                        {name: '广西', value: 45},
                        {name: '贵州', value: 65},
                        {name: '海南', value: 10},
                        {name: '河北', value: 10},
                        {name: '河南', value: 80},
                        {name: '黑龙江', value: 100},
                        {name: '湖北', value: 65},
                        {name: '湖南', value: 10},
                        {name: '吉林', value: 65},
                        {name: '江苏', value: 0},
                        {name: '江西', value: 45},
                        {name: '辽宁', value: 100},
                        {name: '内蒙古', value: 45},
                        {name: '宁夏', value: 65},
                        {name: '青海', value: 65},
                        {name: '山东', value: 65},
                        {name: '陕西', value: 10},
                        {name: '山西', value: 65},
                        {name: '四川', value: 50},
                        {name: '新疆', value: 0},
                        {name: '西藏', value: 100},
                        {name: '云南', value: 10},
                        {name: '浙江', value: 65},
                        {name: '香港', value: 80},
                        {name: '澳门', value: 80},
                        {name: '台湾', value: 45}
                    ],
                    markLine : {    /*轨迹*/
                        smooth:true,
                        symbol: ['none', 'circle'],
                        symbolSize : 1,
                        itemStyle : {
                            normal: {
                                color:'#a6c83f',
                                borderWidth:1,
                                borderColor:'#e6551d'
                            }
                        },
                        data : []
                    }
                },
                {
                    name:'城市',
                    type:'map',
                    mapType:'china',
                    data:[],
                    markLine:{
                        symbol: ['pin','arrow'],
                        symbolSize: [7,5],
                        showAllSymbol: true,
                        smooth:true,
                        effect:{
                            show: true,
                            size: 3,
                            color: "#fc0",
                            shadowColor:"yellow"
                        },
                        itemStyle:{
                            normal:{
                                color:'#a6c83d',
                                borderWidth:1,
                                borderColor:'#a6c83d'
                            }
                        },
                        /*markLine data*/
                        data:[]
                    },
                    markPoint:{
                        effect:{
                            show:true
                        },
                        itemStyle:{
                            normal:{
                                label:{show:true}
                            }
                        },
                        /*markPoint data*/
                        data:[]
                    }
                }
            ]
        },

        init:function () {
            var me = this;

            me.myChart = echarts.init(me.container);
            me.myChart.setOption(me.option);

            me.getData();
        },

        getData:function () {
            var me = this;
            $.ajax({
                type:"get",
                dataType:"json",
                url:"/list/service/system/capital-flow-data",
                success:function (data) {
                    if(data.length<=0){
                        return false;
                    }
                    me.initPlayBar(data);

                    var count = 0, time = 0 ,setDataInterval = setTimeout(setData, time);

                    function setData(){
                        var formatData = me.formatAndPushData(data[count]);
                        time = formatData.time;
                        me.setPlayBar(count);

                        me.option.isRender = false;
                        me.myChart.setOption(me.option);
                        me.myChart.refresh();

                        count++;
                        if (count > data.length-1) {
                            count = 0;
                            clearTimeout(setDataInterval);
                            //me.clearTrack();
                            return false;
                        }
                        setDataInterval = setTimeout(setData, time);
                    }
               },
                error:function(e){
                    console.log(e);
                    clearInterval(me.getDataInterval);
                }
            });
        },

        formatAndPushData:function(data){
            var me = this;
            var time = 0,
                markLine = me.option.series[1].markLine.data,
                markPoint = me.option.series[1].markPoint.data;

            markLine.splice(0,markLine.length);
            markPoint.splice(0,markPoint.length);

            for(var i=0;i<data.args.length;i++){
                var singleData_line = [];

                time = data.time * 1000;
                singleData_line.push({name:data.args[i].from});
                singleData_line.push({name:data.args[i].to});

                markLine.push(singleData_line);
                markPoint.push({name:data.args[i].to});
                //添加轨迹
                //me.option.series[0].markLine.data.push(singleData_line);
            }
            return {
                time:time
            }
        },

        clearTrack:function(){
            var me = this;
            var markTrack = me.option.series[0].markLine.data;
            markTrack.splice(0,markTrack.length);
        },

        initPlayBar:function (data){
            var totalTime = 0,
                totalWidth = $("#play-bar").outerWidth(),
                Temp = '<em style="margin-left: $marginLeft$px">&nbsp;</em>',
                domResult = '';

            for(var i=0;i<data.length;i++){
                var time = data[i].time;
                totalTime += time;
            }

            for(var j=0;j<data.length;j++){
                var time = data[j].time;
                var marginLeft = (time/totalTime*totalWidth -6).toFixed(2);
                domResult += Temp.replace("$marginLeft$",marginLeft);
            }

            $("#play-bar .play-time").html(domResult);
        },

        setPlayBar:function (index){
            var $this = $("#play-bar .play-time em").eq(index);
            $this.addClass("active");

            var offsetLeft = $this[0].offsetLeft.toFixed(2);
            $("#play-bar .progress").attr({style:"width:"+offsetLeft+"px"});
        }
    }
    Date.prototype.Format = function(fmt)
    {
        var o = {
            "M+" : this.getMonth()+1,                 //月份
            "d+" : this.getDate(),                    //日
            "h+" : this.getHours(),                   //小时
            "m+" : this.getMinutes(),                 //分
            "s+" : this.getSeconds()                 //秒
        };
        if(/(y+)/.test(fmt))
            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
        for(var k in o)
            if(new RegExp("("+ k +")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        return fmt;
    };

    function mapDate(){
        return new Date().Format("yyyy-MM-dd")
    }

    $(function () {
        if(!lufax.browser.support()){
            return false;
        }
        var _echart = new EchartHelper($("#main")[0], {isRender:true});
        _echart.init();
    });
}();

!function(){
    function browser(){

    }

    browser.prototype = {
        support:function(){
            var me = this;
            var support = true;
            var agentName = navigator.appName;
            var agentVersion = navigator.appVersion;
            agentVersion = agentVersion.split(";")[1] ? agentVersion.split(";")[1].replace(/[ ]/g,"") : agentVersion;

            if(agentName=="Microsoft Internet Explorer" && agentVersion=="MSIE6.0"){
                me.pop("IE6");
                support = false;
            }else if(agentName=="Microsoft Internet Explorer" && agentVersion=="MSIE7.0"){
                me.pop("IE7");
                support = false;
            }
            return support;
        },

        pop:function(browser){
            LufaxPopup.blankPopup({
                content:'' +
                    '<div class="modal-content pop-lowBrowser">' +
                        '<div class="modal-header clearfix">' +
                            '<div class="close"><a class="modal-close" href="javascript:;"></a></div>' +
                            '<h4 class="modal-title">提示</h4>' +
                        '</div>' +
                        '<div class="modal-body clearfix">' +
                            '<div class="logo">&nbsp;</div>' +
                            '<div class="content">' +
                                '<h2 class="title">您当前的版本可能为<strong>'+browser+'</strong>，无法正常浏览本页面</h2>' +
                                '<p class="suggest">为了最佳的浏览体验，建议您使用以下浏览器：</p>' +
                                '<div class="availableBrowser">' +
                                    '<a class="browser IE" href="http://www.microsoft.com/zh-cn/download/internet-explorer-9-details.aspx" target="_blank">IE9.0</a>' +
                                    '<a class="browser firefox" href="http://download.firefox.com.cn/releases/webins3.0/official/zh-CN/Firefox-latest.exe" target="_blank">firefox</a>' +
                                    '<a class="browser chrome" href="https://www.google.com/intl/zh-CN/chrome/browser/index.html" target="_blank">chrome</a>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>',
                onConfirm:function () {}
            });
        }
    }
    lufax.com.browser = browser;
    lufax.com.browser = new browser();
    lufax.browser = lufax.com.browser;
}(this);
