//jsx 解析结果
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


function dfsForElementData(myElementData){
    let {type,props} = myElementData;
    let {id,children} = props;
    if(!id){
        id  = props.nodeValue;
    }
    
    let nodeStartTime = performance.now();

    console.log(`id = ${id}---beginWork`);
    if(Array.isArray(children) && children.length>0){
        children.forEach(item=>{
            dfsForElementData(item);
        });
    }

    let startTime = performance.now();
    let endTime = startTime;
    //死循环10ms
    while(endTime-startTime<=10){
        endTime = performance.now();
    }

    //node 总消耗时间
    let spendTime = performance.now() - nodeStartTime;
    console.log(`id = ${id}---completeWork-----spendTime=${spendTime}`);
}



myElementData.return = null;
myElementData.child = null;
myElementData.sibling = null;

let fiberRoot = myElementData;

messageChannelForElementData(fiberRoot);

//合作时 工作模式
function messageChannelForElementData(fiberNode){

    //当前fiber
    //构建子fiber
    let workInProgressNode =  fiberNode;

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

        //出栈流程怎么模拟
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
        }
    }

    //executeMyTask
    const wookLoop = (deadline)=>{
        let startTime = performance.now();
        //没次分配5ms
        // 5是react 目前的定义时间
        while(hasTask() && performance.now()-startTime < 5 ){
            //返回下一个要执行的 任务/节点/单元任务
            //一个工作单元做完了，返回
            workInProgressNode = performUnitOfWork();    
        }

        if(hasTask()){
            port1.postMessage(null);
        }else{
            //干完活了，可以构建界面了
            console.log(`commit for UI~~~`);
            console.log(`myElementData=${JSON.stringify(myElementData)}`)
        }
    }

    //异步任务
    port1.postMessage(null);

    port2.onmessage = wookLoop;

}



