import { TAG_ROOT, ELEMENT_TEXT, TAG_HOST, TAG_TEXT, PLACEMENT,DELETION ,UPDATE ,TAG_CLASS, TAG_FUNCTION_COMPONENT } from "./constants";
import {setProps} from './utils';
import {UpdateQueue,Update} from './updateQueue';

//全局Root
let currentRoot = null;

//正在构建的一颗树
let workInProgressRoot:fiber = null;
let nextUnitOfWork:fiber = null;

export const scheduleRoot = (rootFiber)=>{

    //一次不存在 currentRoot
    if(!currentRoot) {
        /*
        let rootFiber = {
            tag:TAG_ROOT, //每个fiber会有一个tag标示此元素类型
            stateNode:container,//一般情况下如果这个元素是一个原生节点的话，stateNode指向真实DOM元素
            props:{children:[element]}//这个fiber的属性对象children属性，里面放的是要渲染的元素
            child:null,
            subling:null,
            return:null
        }
        from react-dom.ts
        */
        //一切从头开始
        workInProgressRoot = rootFiber;
    }
    //清空指针
    workInProgressRoot.firstEffect = workInProgressRoot.lastEffect = workInProgressRoot.nextEffect = null;
    nextUnitOfWork = workInProgressRoot;
}

const updateHostRoot = (currentFiber)=>{
    
}

const updateHostText = (currentFiber)=>{
    
}

const updateHost = (currentFiber)=>{
    
}

const updateClassComponent = (currentFiber)=>{

}

const updateFunctionComponent = (currentFiber)=>{

}

// 构建dom
// 返回下一个 fiber
const beginWork = (currentFiber:fiber)=>{
    if(currentFiber.tag === TAG_ROOT) {
        updateHostRoot(currentFiber);
    }else if(currentFiber.tag === TAG_TEXT) {
        updateHostText(currentFiber);
    }else if(currentFiber.tag === TAG_HOST) { //stateNode是dom
        updateHost(currentFiber);
    }else if(currentFiber.tag === TAG_CLASS) {
        updateClassComponent(currentFiber);
    }else if(currentFiber.tag === TAG_FUNCTION_COMPONENT) {
        updateFunctionComponent(currentFiber);
    }
}


/*
基本工作内容:

1、执行一个fiber,通过虚拟节点构建出一个真实节点(或者通过对比复用一个节点) reconcileChildren
2、构建出下一个fiber基本结构(通过函数返回)


//构建真实节点
//返回下个节点
beginWork()

//构建 effectList
//关闭 fiber/组件 标签 
completeUnitOfWork();

*/

const performUnitOfWork:fiber = ()=>{
    beginWork(currentFiber);

    if(currentFiber.child){
        return currentRoot.child;
    }
}

//一个工作循环,每个循环到，remaining()<2时，可以中断，等待下次loop执行
const workLoop = (deadline)=>{
    //react是否要让出时间或说控制权
    //let shouldYield = false;
    //是否还要剩余时间
    //1、该值是动态的，随着fiber的执行，不断重新获取,至到 remaining()<2时，置为false
    //2、nextUnitOfWork,以一个需要执行的任务,如果为null,任务loop断开，循环结束
    let hasIdleTime = true;
    //1、是否有任务 && 2、是否有时间
    while (nextUnitOfWork && hasIdleTime) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

        //deadline 观察者模式，被观察值提供的
        hasIdleTime = deadline.timeRemaining() < 2?true:false;
    }
}


//react询问浏览器空闲时执行
// 可理解为观察者模式
window.requestIdleCallback(workLoop,{timeout:200});




