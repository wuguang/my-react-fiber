import { TAG_ROOT, ELEMENT_TEXT, TAG_HOST, TAG_TEXT, PLACEMENT,DELETION ,UPDATE ,TAG_CLASS, TAG_FUNCTION_COMPONENT } from "./constants";
import {UpdateQueue,Update} from './updateQueue';

//全局Root
let currentRoot:Fiber = null;

//正在构建的一颗树
let workInProgressRoot:Fiber = null;
let nextUnitOfWork:Fiber = null;
let workInProgressFiber:Fiber = null; //正在工作中的fiber
let hookIndex = 0;//hooks索引
let rootFiber:Fiber = null;

export const scheduleRoot = ()=>{

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


const reconcileChildren = (currentFiber,newChildren)=>{
    //从开始
    let newChildIndex = 0;//新子节点的索引
    //对应的老节点，如果有的化,
    //和currentFiber对应的oldFiber
    //至少渲染一次才有
    let oldFiber = currentFiber.alternate;
    //老节点的子节点,和当前节点对应,需要对比的
    let oldFiberChild = oldFiber && oldFiber.child;

    if(oldFiberChild) oldFiber.firstEffect = oldFiber.lastEffect = oldFiber.nextEffect = null;
    let prevNewFiber:Fiber;//上一个新的子fiber,缩影>0时用到
    //此处需要对比
    //当前的树的children和 上次渲染的fiber链表之间的对比
    while(newChildIndex<newChildren.length||oldFiberChild){
        let newChild = newChildren[newChildIndex]; //取出新的虚拟DOM节点
        let newFiber:Fiber = null;
        //
        let sameType = oldFiberChild && oldFiberChild.tag === newChild.tag;
        let tag;
        if(typeof newChild.type === 'string'){
            if(newChild.type === 'TEXT'){
                tag = TAG_TEXT;
            }else{
                tag = TAG_HOST;
            }
        }else if(typeof newChild.type === 'function'){

        }



    }
}

const updateDOM = (stateNode,oldProps,newProps)=>{
    if(stateNode && stateNode.setAttribute) {
        setProps(stateNode,oldProps,newProps);
    }
}

const createDom = (currentFiber)=>{
    if(currentFiber.tag === TAG_TEXT) {
        return document.createTextNode(currentFiber.props.text);
    }else if(currentFiber.tag === TAG_HOST) {
        let stateNode = document.createElement(currentFiber.type);
        updateDOM(stateNode,{},currentFiber.props);
        return stateNode;
    }
}

//构建新节点 Dom节点
const updateHostRoot = (currentFiber:Fiber)=>{
    let newChildren = currentFiber.props.children;
    reconcileChildren(currentFiber,newChildren);//reconcile协调
}

//不需要协调
const updateHostText = (currentFiber)=>{
    //直接创建节点
    if(!currentFiber.stateNode) {//如果此fiber没有创建DOM节点
        currentFiber.stateNode = createDom(currentFiber);
    }
}

const updateHost = (currentFiber)=>{
    //直接创建Dom节点
    if(!currentFiber.stateNode) {
        currentFiber.stateNode = createDom(currentFiber);
    }
    const newChildren = currentFiber.props.children||[];
    //进入协调阶段
    reconcileChildren(currentFiber,newChildren);
}

const updateClassComponent = (currentFiber)=>{
    if(!currentFiber.stateNode) { //类组件 stateNode是组件的实例
        //new ClassComponent
        currentFiber.stateNode = new currentFiber.type(currentFiber.props);
        //先不管
        currentFiber.stateNode.internalFiber = currentFiber;
        //队列挂载
        currentFiber.updateQueue = new UpdateQueue();//更新队列
    }
    //得到
    currentFiber.stateNode.state = currentFiber.updateQueue.forceUpdate(currentFiber.stateNode.state);
    //执行render方法
    //render执行的结果；即每个Component执行的结果,即返回reactElement
    let newElement = currentFiber.stateNode.render();

    //包裹成数组
    const newChildren = [newElement];
    reconcileChildren(currentFiber,newChildren);
}

const updateFunctionComponent = (currentFiber:Fiber)=>{
    workInProgressFiber = currentFiber;
    hookIndex = 0;
    workInProgressFiber.hooks = [];
    const newChildren = [currentFiber.type(currentFiber.props)];
    reconcileChildren(currentFiber,newChildren);
}




// 构建dom
// 返回下一个 fiber
const beginWork = (currentFiber:Fiber)=>{
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

const performUnitOfWork = (currentFiber:Fiber):Fiber=>{
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

const setProps = (dom,oldProps,newProps)=>{
    for(let key in oldProps){
        if(key !== 'children') {
            if(newProps.hasOwnProperty('key')) {//新老都有更新
                setProp(dom, key,newProps[key]);
            }else{//老的有新的没有删除
                dom.removeAttribute(key);
            }
        }
    }
    for(let key in newProps){
        if(key !== 'children') {
            if(!oldProps.hasOwnProperty('key')) {//老的没有新的有，添加
                setProp(dom, key, newProps[key]);
            }
        }
    }
}

const setProp = (dom,key,value)=>{
    if(/^on/.test(key)) {
        dom[key.toLowerCase()] = value;//没有用合成事件
    }else if(key === 'style') {
        if(value){
            let styleStr = '';
            for (let styleName in value){
                if (value.hasOwnProperty(styleName)) {
                    dom.style[styleName] = value[styleName];
                    let styleValue = value[styleName];
                    if(styleName === 'borderRadius'){
                        styleName = 'border-radius';
                    }
                    styleStr += `${styleName}:${styleValue}${typeof styleValue === 'number'?'px':''};`
                }
            }
            dom.setAttribute('style',styleStr);
        }
    }else {
        if(key === 'className'){
            key = 'class';
        }
        dom.setAttribute(key,value);
    }
    return dom;
}


//react询问浏览器空闲时执行
// 可理解为观察者模式
window.requestIdleCallback(workLoop,{timeout:200});




