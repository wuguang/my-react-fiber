


children:[1,2]

linked:1,2...;

oldFiber.child;
oldFiber.child.sibling;
//第一轮循环 终结； 当一个相应位置...
break;



----> 


// children over ----> older delete 

// oldfier over ---- > newFier Placement







newFiber; newIndex;


let lastPlacedIndex = 2;

odlFiberMap  ={
    key:{
        index:0,
    }
    ................................
}


linked:1,2...;

oldFiber.child;
oldFiber.child.sibling;
//第一轮循环 终结； 当一个相应位置...
break;

lastPlacedIndex = 0；





for(newIndex...; length-1){
    newFiber.key;
    //Placement 
    //remove老节点

}

a    bcde ===》

//dom---move --- 怎么



fiber:{
    key:1;
}

{ 
    key:
}

//oldIndex = 1 >=
//lastPlacedIndex =4

lastPlacedIndex = oldIndex;


a    ebcd 

lastPlacedIndex = 0;

newIndex = 1;

break;
------>
odl Map {ebcd}

ebcd===>

  newIndex=1;
  e;==>{
      oldIndex = 4;
      lastPlacedIndex= 0;
      lastPlacedIndex= 4;
  }

  newIndex = 2;
  b;==>{
    oldIndex:1;
    lastPlacedIndex = 4;
    oldIndex < lastPlacedIndex;
    //move==>
  }

  newIndex = 3;
  b;==>{
    oldIndex:1;
    lastPlacedIndex = 4;
    oldIndex < lastPlacedIndex;
    //move==>
  }

  newIndex = 4;
  d;==>{
    oldIndex:1;
    lastPlacedIndex = 4;
    oldIndex < lastPlacedIndex;
    //move==>
  }












  if(oldIndex >= lastPlacedIndex){
     lastPlacedIndex = old; 
     //
 }else{
    oldIndex < lastPlacedIndex;
    //move点
}







 














新

children:{
    "type":"TEXT",
    "props":{
        "nodeValue":"hello world h2",
        "children":[

        ]
    }
};

children:0;
children:string;

命中 //类 组件/div/p

linked 



fiber 

dom :property 

update;

newFiber.effectTag = UPDATE;



//老节点其他节点 delete;

let deletions = [oldfiber];










children:[];

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


//合作时 工作模式
function idleForElementData(myElementData){

    let workInProgressNode =  myElementData;

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

    //executeMyTask
    const wookLoop = (deadline)=>{

        while(hasTask() && deadline.timeRemaining()>5){
            //返回下一个要执行的 任务/节点/单元任务
            //一个工作单元做完了，返回
            workInProgressNode = performUnitOfWork();    
        }

        if(hasTask()){
            //需要继续干活
            requestIdleCallback(wookLoop,{timeout:1000});
        }else{
            //干完活了，可以构建界面了
            console.log(`commit for UI~~~`);
        }
    }

    //下一帧主线程空闲，此触发回调
    //wookLoop，可认为是回调
    requestIdleCallback(wookLoop,{timeout:1000});
}



//合作时 工作模式
function messageChannelForElementData(myElementData){

    let workInProgressNode =  myElementData;

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

    //executeMyTask
    const wookLoop = (deadline)=>{
        let startTime = performance.now();
        alert(startTime);
        //没次分配5ms
        while(hasTask() && performance.now()-startTime < 5 ){
            //返回下一个要执行的 任务/节点/单元任务
            //一个工作单元做完了，返回
            workInProgressNode = performUnitOfWork();    
        }

        if(hasTask()){
            port1.postMessage(null, port1);
        }else{
            //干完活了，可以构建界面了
            console.log(`commit for UI~~~`);
        }
    }

   

    port1.postMessage(null, port1);
    port2.onMessage = wookLoop;

}






function one(myElementData){
    let {props} = myElementData;
    let {id,children} = props;

    id = id||props.nodeValue;
    console.log(`begin --- id = ${id}`);
    
    if(children.length>0){
        children.forEach(item=>{
            // item 独立的node 
            one(item);
        })
    }

    console.log(`complete --- id = ${id}`);


}

one(myElementData);



function two(myElementData){
    //执行单元


}

timeSliceForElementData(myElementData);


let rootNode = {
    nextEffect:{
        ...node01,
        nexEffect:{
            ...node02
        }
    }
}

