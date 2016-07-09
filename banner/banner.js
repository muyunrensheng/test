define(["avalon","text!./banner.html"],function(avalon,template){
    var widget = avalon.ui.banner = function(element,data,vmodels){

        var options = data.bannerOptions;
        options.template = template;

        var vmodel = avalon.define(data.bannerId,function(vm){
            avalon.mix(vm, options);

            element.style.width = vm.width;
            element.style.height = vm.height;

            vm.now = 0;
            vm.$skipArray = ['direct','now'];
            vm.directTag = true;
            vm.onLeftDirect = false;
            vm.onRightDirect = false;
            vm.clickArrow = function(){};

            vm.$init = function(continueScan){
                element.innerHTML = options.template;

                require(['jquery'],function($){

                    var box = $(element);
                    var ul = box.find('ul');
                    var li = ul.find('li');
                    var width = box.innerWidth();
                    var dl = box.find('dl');
                    var dd = box.find('dd');
                    var timer;
                    var direct = box.find('.banner-direct-tag');

                    //ul和li的宽度
                    li.css('width',width);
                    ul.css('width',width*li.length);
                    //设置dl的宽度
                    dl.css('width',dd.outerWidth(true)*dd.length);
                    //设置箭头位置
                    direct.css('top',(box.height()-direct.height())/2);
                    //经过箭头时，改变class
                    direct.hover(function(){
                        $(this).addClass('active');
                    },function(){
                        $(this).removeClass('active');
                    });


                    //复制ul，实现无缝滚动
                    var ul2 = ul.clone(true);
                    ul.parent('div').append(ul2);

                    //动画开始
                    animateRun();
                    //鼠标移入移出banner时，停止和重新开始动画
                    box.on({
                        'mouseenter':function(){
                            clearInterval(timer);
                            direct.show();
                        },
                        'mouseleave':function(){
                            animateRun();
                            direct.hide();
                        }
                    });
                    //点击指示点
                    dd.on('click',function(){
                        var index = $(this).index();
                        _animate(vm,width,box,index);
                    });
                    //点击箭头
                    vm.clickArrow = function(direct){
                        var nowDirect = vm.direct;
                        vm.direct = direct;
                        _animate(vm,width,box);
                        vm.direct = nowDirect;
                    };


                    //设置定时器，开始动画
                    function animateRun(){
                        timer = setInterval(function(){
                            _animate(vm,width,box);
                        },vm.interval * 1000);
                    }


                });

                if(continueScan){
                    continueScan()
                }else{
                    avalon.log("请尽快升到avalon1.3.7+");
                    avalon.scan(element, _vmodels);
                    if (typeof options.onInit === "function") {
                        options.onInit.call(element, vmodel, options, vmodels)
                    }
                }
            }
        });

        /*动画效果 开始*/
        var _animate = function(vm,width,box,now){
            var num = vm.pic.length;
            var o;
            var ul1 = box.find('ul').eq(0);
            var ul2 = box.find('ul').eq(1);
            var dd = box.find('dd');

            if(now === undefined){
                if(vm.direct === 'right'){
                    if(vm.now > 0){
                        vm.now--;
                    }else{
                        vm.now = num-1;
                        ul2.css('marginLeft',-num*width +'px');
                        ul1.before(ul2);
                        o = ul1;
                        ul1 = ul2;
                        ul2 = o;
                    }
                }else{
                    if(vm.now < num){
                        vm.now++;
                    }else{
                        vm.now = 1;
                        ul1.css('marginLeft',0);
                        ul1.before(ul2);
                        o = ul1;
                        ul1 = ul2;
                        ul2 = o;
                    }

                }
            }else{
                vm.now = now;
            }

            ul1.stop(true,true).animate({'marginLeft':-vm.now * width + 'px'},vm.speed * 1000);
            ul2.css('margin',0);
            dd.eq(vm.now!=4?vm.now:0).addClass('active').siblings().removeClass('active');

        };
        /*动画效果 结束*/


        return vmodel;

    };

    widget.version = '1.0';

    widget.defaults={
        width:'800px',
        height:'300px',
        direct:'left',
        interval:3,
        speed:0.5
    };
});