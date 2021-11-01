var isHostCallbackScheduled = false;

//任务队列
//teskQueue
//peek(),查看第一个元素，单不删除
// 

interface root {
    container:{
        
        _reactRootContainer:_reactRootContainer;
    }
    
    
}


interface _reactRootContainer{
    callbackNode: null;
    callbackPriority: 0;
    containerInfo: any;
    context: null
    current: any;
    //FiberNode {tag: 3, key: null, elementType: null, type: null, stateNode: FiberRootNode}
    effectDuration: 0;
    entangledLanes: 0;
    entanglements: any;
    eventTimes: number[];
    expirationTimes:  number[];
    expiredLanes: 0
    finishedLanes: any;
}


interface queue{
    callback: ()=>void;
    expirationTime: 8965.100000000093
    id: 1
    priorityLevel: 3
    sortIndex: 8965.100000000093
    startTime: 3965.100000000093
}


function updateContainer(){
    
}

function flushWork(hasTimeRemaining, initialTime){


}


