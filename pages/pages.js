define(["avalon","text!./pages.html","css!./pages.css"],function(avalon,template){

    var widget = avalon.ui.pages = function(element,data,vmodels){

        var options = data.pagesOptions;
        options.template = template;

        var vmodel = avalon.define(data.pagesId,function(vm){
            //更新默认设置
            avalon.mix(vm, options);

            vm.$skipArray = ['total','pages'];
            vm.pages=0;
            vm.pagesArr=[];
            vm.nowPagesArr=[];
            vm.process=true;


            //改变当前页数，并发出异步请求，获取数据
            vm.changeRecentPage = function(index){
                if(index == 0){return false;}
                if(index == vm.recentPage){return false;}
                if(vm.process){
                    vm.recentPage = parseInt(index);
                    changePages();
                    update();
                }

            };

            //插件初始化
            vm.$init = function(continueScan){
                element.innerHTML = template;


                require(['jquery'],function($){
                    //为页码绑定鼠标经过事件，改变样式
                    $(element).on('mouseenter','li',function(){
                       $(this).addClass('hover');
                    }).on('mouseleave','li',function(){
                       $(this).removeClass('hover');
                    });

                    //初始化第一次请求异步数据
                    update();

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
            };

            //根据总条数和分页条数来计算页数
            function setPages(){
                vm.pagesArr = [];
                for(var i = 1;i<=parseInt(vm.pages);i++){
                    vm.pagesArr.push(i);
                }
            }

            //生成当前显示页码
            function changePages(){
                vm.nowPagesArr = [];
                var i;

                if(vm.recentPage > 1){
                    vm.nowPagesArr.push({name:'上一页','pages':vm.recentPage - 1,'active':false});
                }

                if(vm.recentPage > 4){
                    vm.nowPagesArr.push({name:1,'pages':1,'active':false});
                    vm.nowPagesArr.push({name:'...','pages':0,'active':false});
                    if(vm.recentPage != vm.pagesArr.length){
                        for(i = vm.recentPage -2;i < vm.recentPage;i++){
                            vm.nowPagesArr.push({name:i,'pages':i,'active':false});
                        }
                    }else{
                        for(i = vm.recentPage -3;i < vm.recentPage;i++){
                            vm.nowPagesArr.push({name:i,'pages':i,'active':false});
                        }
                    }

                }else{
                    for(i = 1;i < vm.recentPage;i++){
                        vm.nowPagesArr.push({name:i,'pages':i,'active':false});
                    }
                }

                vm.nowPagesArr.push({name:vm.recentPage,'pages':vm.recentPage,'active':true});

                if(vm.recentPage < vm.pagesArr.length - 4){
                    for(i = vm.recentPage + 1; i < vm.recentPage + 3; i++){
                        vm.nowPagesArr.push({name:i,'pages':i,'active':false});
                    }
                    vm.nowPagesArr.push({name:'...','pages':0,'active':false});
                    vm.nowPagesArr.push({name:vm.pagesArr.length,'pages':vm.pagesArr.length,'active':false});
                }else{
                    for(i = vm.recentPage + 1;i<=vm.pagesArr.length;i++){
                        vm.nowPagesArr.push({name:i,'pages':i,'active':false});
                    }
                }

                if(vm.recentPage < vm.pagesArr[vm.pagesArr.length-1]){
                    vm.nowPagesArr.push({name:'下一页','pages':vm.recentPage + 1,'active':false});
                }

            }

            //发出异步请求获取数据
            function update(){
                if(vm.url != ''){
                    vm.process = false;
                    $.ajax({
                        url:vm.url,
                        data:{
                            recentPage:vm.recentPage,
                            perPages:vm.perPages
                        },
                        dataType:'json',
                        type:'post',
                        success:function(data){
                            vm.total = parseInt(data.total);
                            vm.pages = Math.ceil(vm.total / vm.perPages);
                            setPages();
                            changePages();
                            vm.process = true;
                            vm.$fire('up!data', data.data);
                        },
                        error:function(){
                            vm.error();
                            vm.process = true;
                        }
                    })
                }else{
                    alert('数据请求地址不能为空！');
                }
            }


        });

        return vmodel;
    };


    widget.defaults = {
        url:'',//请求地址
        perPages:5,//每页条数
        total:0,//总条数
        recentPage:1,//当前页数
        error:function(){
            alert('请求数据失败！');
        }
    }
});