let myElementData = {
    "type":"div",
    "props":{
        "id":"01",
        "children":[
            {
                "type":"h2",
                "props":{
                    "id":"02",
                    "children":[
                        {
                            "type":"TEXT",
                            "props":{
                                "nodeValue":"hello world h2",
                                "children":[

                                ]
                            }
                        }
                    ]
                }
            },
            {
                "type":"div",
                "props":{
                    "id":"03",
                    "children":[
                        {
                            "type":"p",
                            "props":{
                                "id":"04",
                                "children":[
                                    {
                                        "type":"span",
                                        "props":{
                                            "id":"05",
                                            "children":[
                                                {
                                                    "type":"TEXT",
                                                    "props":{
                                                        "nodeValue":"我是span",
                                                        "children":[

                                                        ]
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            },
            {
                "type":"ul",
                "props":{
                    "id":"06",
                    "children":[
                        {
                            "type":"li",
                            "props":{
                                "id":"07",
                                "children":[
                                    {
                                        "type":"TEXT",
                                        "props":{
                                            "nodeValue":"我是1",
                                            "children":[

                                            ]
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            "type":"li",
                            "props":{
                                "id":"08",
                                "children":[
                                    {
                                        "type":"TEXT",
                                        "props":{
                                            "nodeValue":"我是2",
                                            "children":[

                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            },
            {
                "type":"h3",
                "props":{
                    "id":"09",
                    "children":[
                        {
                            "type":"TEXT",
                            "props":{
                                "nodeValue":"hello world h3",
                                "children":[]
                            }
                        }
                    ]
                }
            }
        ]
    }
};

//合作时 工作模式
function messageChannelForElementData(myElementData){

    let workInProgressNode =  myElementData;
    let yieldInterval = 5;

    //下一帧主线程空闲，此触发回调
    //wookLoop，可认为是回调
    const channel = new MessageChannel();
    const port1 = channel.port1;
    const port2 = channel.port2;

    const hasTask = ()=>{
        return workInProgressNode?true:false;
    }

    const beginWork = ()=>{
        //带构建节点

        let {type,props} = workInProgressNode;

        let {id,children} = props;
        if(!id){
            id  = props.nodeValue;
        };
        console.log(`id = ${id}---beginWork`);

        if(Array.isArray(children) && children.length>0){
            let childrenLen = children.length;
            //构建 直接子节点的return 和 sibling 指针
            //目的，防止任务被中断后，可以继续追踪任务，让任务可以继续执行下去
            children.forEach((node,index)=>{
                if(index === 0){
                    //actually is firstChild!!
                    workInProgressNode.child = node;
                }
                node.return = workInProgressNode;
                if(children[index+1]){
                    node.sibling = children[index+1];
                }
            });
        }
    }

    const completeWork = ()=>{
        let {props} = workInProgressNode;
        let {id} = props;
        if(!id){
            id  = props.nodeValue;
        };
        console.log(`id = ${id}---completeWork`);
    }

    const getCurNodeId = ()=>{
        let {props} = workInProgressNode;
        let {id} = props;
        if(!id){
            id  = props.nodeValue;
        };
        return id;
    }

    //执行一个节点,保持和react名名一致
    const performUnitOfWork = ()=>{
        console.log(`performUnitOfWork ---start`);
        beginWork();
        //-----这里怎么写是关键
        //有子节点
        if(workInProgressNode.child){
            workInProgressNode = workInProgressNode.child;
            console.log(`performUnitOfWork ---end`);
            return workInProgressNode;
        }else{
            while(workInProgressNode){
                completeWork();
                if(workInProgressNode.sibling){
                    return workInProgressNode.sibling;
                }
                workInProgressNode = workInProgressNode.return;
            }

            /*
            //没有子节点
            //当前节点完成
            completeWork();

            //收到顶层 
            //或该单独元素的顶层
            //workInProgressNode.return 必须有值
            //返回值不能保证 一定有
            //所以workInProgressNode要判断
            while(!workInProgressNode.sibling && workInProgressNode.return){
                workInProgressNode = workInProgressNode.return;
                completeWork();
            }
            console.log(`performUnitOfWork ---end`);
            return workInProgressNode.sibling;
            */

            //==>




            /*
            while(workInProgressNode){
                completeWork();
                if(workInProgressNode.sibling){
                    return workInProgressNode.sibling;
                }
                workInProgressNode = workInProgressNode.return;
            }*/
        }
    }

    const timeHasRemaining = (startTime)=>{
        return performance.now() - startTime > yieldInterval?false:true;
    }


    //executeMyTask
    const wookLoop = ()=>{
        let startTime = performance.now();
        //没次分配5ms
        while(hasTask() && timeHasRemaining(startTime) ){
            //返回下一个要执行的 任务/节点/单元任务
            //一个工作单元做完了，返回
            workInProgressNode = performUnitOfWork();    
        }

        if(hasTask()){
            port2.postMessage(null);
        }else{
            //干完活了，可以构建界面了
            console.log(`commit for UI~~~`);
        }
    }

   

    port2.postMessage(null);
    port1.onmessage = wookLoop;

}


messageChannelForElementData(myElementData);