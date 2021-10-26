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
let deletions:Fiber[] = [];
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
/*
调和阶段的核心 
容器节点和 子节点之间的关系 建立
*/

const reconcileChildren = (currentFiber,newChildren)=>{
    //从开始
    let newChildIndex = 0;//新子节点的索引
    //对应的老节点，如果有的化,
    //和currentFiber对应的oldFiber
    //至少渲染一次才有
    let oldFiber = currentFiber.alternate;
    //老节点的子节点,和当前节点对应,需要对比的
    //第一个旧的子节点
    let oldFiberChild = oldFiber && oldFiber.child;
    //清除 老节点的effect指向
    if(oldFiberChild) oldFiber.firstEffect = oldFiber.lastEffect = oldFiber.nextEffect = null;
    let prevSibling:Fiber;//上一个新的子fiber,缩影>0时用到
    //此处需要对比
    //当前的树的children和 上次渲染的fiber链表之间的对比
    //newChildIndex<newChildren.length 
    //新旧节点只要有一个存在，即可对比
    //如果都不存在，则暂停对比

    /*
    真实的
    */
    while(newChildren[newChildIndex]||oldFiberChild){
        let newChild = newChildren[newChildIndex]; //取出新的虚拟DOM节点
        let newFiber:Fiber = null;
        let tag;
        if(newChild){
            if(typeof newChild.type === 'function' && newChild.type.isReactComponent){
                tag = TAG_CLASS;
            }else if(typeof newChild.type === 'function'){
                tag = TAG_FUNCTION_COMPONENT;
            }else if(newChild.type === ELEMENT_TEXT){
                tag = TAG_TEXT;
            }else if(typeof newChild.type === 'string'){
                tag = TAG_HOST;
            }
        }
        //对比tag, 如果直接对比$$type是否可以，如何可以就不用构建tag了
        let sameType = oldFiberChild && oldFiberChild.tag === newChild.tag;
        //对比 相同节点
        if(sameType){
            //sameType时;newChild一定存在
            //为什么有这样的分类????更新节点么??
            if(oldFiberChild.alternate){
                //复用老的节点
                newFiber = oldFiberChild.alternate;
                //可能有新的属性,所有要更新
                newFiber.props = newChild.props;
                newFiber.alternate = oldFiberChild;
                //为什么都是UPDATE
                //节点相同需要全部更新么？？？更新tag
                newFiber.effectTag = UPDATE;
                //任何child第一建立以后都有updateQueue
                newFiber.updateQueue = oldFiberChild.updateQueue || new UpdateQueue();
                newFiber.nextEffect = null;
            }else{
                //
                newFiber = {
                    tag,
                    type:oldFiberChild.type,
                    props:  newChild.props, //一定要新的
                    stateNode:oldFiberChild.stateNode,
                    updateQueue:oldFiberChild.updateQueue || new UpdateQueue(),
                    //父节点
                    return:currentFiber,
                    alternate: oldFiberChild,//让新的fiber的alternate指向老的fiber
                    effectTag:  UPDATE,
                    nextEffect:null
                }
            }
            //不tong
        }else{
            if(newChild){
                newFiber = {
                    tag,
                    $$typeof:newChild.tag,
                    type:   newChild.type,
                    props:  newChild.props,
                    stateNode:  null,//div还没有创建DOM元素
                    //所有的子节点指向同一个父节点,因为公用一个容器
                    return: currentFiber,//父Fiber returnFiber
                    updateQueue: new UpdateQueue(),
                    effectTag:  PLACEMENT,//副作用标示，render会收集副作用 增加 删除 更新
                    //可以不加nextEffect
                    //nextEffect:null,//effect list也是一个单链表 顺序和完成顺序一样 节点可能会少
                }
            }

            //任然挂载在旧的fiber树上的
            //deletions 数组需要单独处理
            if(oldFiberChild){
                oldFiberChild.effectTag = DELETION;
                deletions.push(oldFiberChild);
            }
        }
        //上一个子节点构建结束,开始构建下一个子节点
        //旧节点,更新oldFiberChild的指向
        //可能为空null
        if(oldFiberChild){
            //下一个节点指向 oldFiberChild的sibling;
            oldFiberChild = oldFiberChild.sibling;
        }
        //child串起来
        if(newFiber){
            if(newChildIndex == 0){
                currentFiber.child = newFiber;
            }else{
                prevSibling.sibling = newFiber; 
                //sibling
            }
            prevSibling = newFiber;
        }
        newChildIndex ++;  
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
        return currentFiber.child;
    }
    //遇到容器节点
    while(currentFiber){
        completeUnitOfWork(currentFiber);
        if(currentFiber.sibling){
            return currentFiber.sibling;
        }
        //父节点能返回么？
        //父节点，完善completeUnitOfWork
        //回溯 父节点,执行completeUnitOfWork,找到sibling
        currentFiber = currentFiber.return;
    }
}

const completeUnitOfWork = (currentFiber:Fiber)=>{
    //找到父节点
    let returnFiber = currentFiber.return;
    //如果没有父节点，那么一定是到达fiberRoot
    if(returnFiber){
        //如何节点没有
        //父级节点,没有firstEffect 和 lastEffect 时 ，是同步没有的
        if(!returnFiber.firstEffect && !returnFiber.lastEffect){
            returnFiber.firstEffect = currentFiber.firstEffect;
            returnFiber.lastEffect = currentFiber.lastEffect;
        }else{
            if(currentFiber.lastEffect){
                //将父节点的fiber 拼凑完整
                returnFiber.lastEffect.nextEffect = currentFiber.firstEffect;
                returnFiber.lastEffect = currentFiber.lastEffect;
            }
        }
        //如何父节点有，自己点也有
        const {effectTag} = currentFiber;
        if(effectTag){
            //firstEffect 的构架原则
            //lastEffect永远执行最后一个有effectTag 的节点
            if(returnFiber.lastEffect){
                returnFiber.lastEffect.nextEffect = currentFiber;
            }else{
                returnFiber.firstEffect = currentFiber;
            }
            returnFiber.lastEffect = currentFiber;
        }
    }
}

//每个循环单元处理 节点
const commitWork = (currentFiber)=>{
    //currentFiber要不要判断类型??
    //不需要再操作中处理
    if(!currentFiber) return;
    let returnFiber = currentFiber.return;
    while(returnFiber.tag !== TAG_HOST && 
        returnFiber.tag !== TAG_ROOT &&
        returnFiber.tag !== TAG_TEXT ){
        returnFiber = returnFiber.return;
    }
    //找到真实的父节点
    let domReturn = returnFiber.stateNode;
    if(currentFiber.effectTag === PLACEMENT) {//处理新增节点
        let nextFiber = currentFiber;
        //这句是否要删除!!!
        //不需要这句
        if(nextFiber.tag === TAG_CLASS) {
            return;
        }
        //如果要挂载的节点不是dom节点，比如说是类组件fiber，一直找第一个儿子，直到找到真实DOM
        while (nextFiber.tag !== TAG_HOST && 
            nextFiber.tag !== TAG_TEXT ) {
                nextFiber = currentFiber.child;
            }
        domReturn.appendChild(nextFiber.stateNode);
    }else if(currentFiber.effectTag === DELETION) {//删除节点
        return commitDeletion(currentFiber,domReturn);
    }else if(currentFiber.effectTag === UPDATE) {
        //type 为什么不用tag
        //文本节点 直接赋值过去就行了!!!
        if(currentFiber.type === ELEMENT_TEXT) {
            if(currentFiber.alternate.props.text != currentFiber.props.text){
                currentFiber.stateNode.textContent = currentFiber.props.text;
            }
        }else{
            updateDOM(currentFiber.stateNode,currentFiber.alternate.props,currentFiber.props)
        }
    }
}


const commitDeletion = (currentFiber,domReturn)=>{
    if(currentFiber.tag == TAG_HOST || currentFiber.tag == TAG_TEXT){
        domReturn.removeChild(currentFiber.stateNode);
    }else{
        //获取到真实的dom节点在进行删除
        commitDeletion(currentFiber.child,domReturn);
    }
}


//commit阶段，不会中断,
//一起完成!！
const commitRoot = ()=>{
    deletions.forEach(commitWork);
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
        hasIdleTime = deadline.timeRemaining() < 1?true:false;
    }
    //fiber 树构建完毕
    //进入提交阶段
    if(!nextUnitOfWork && workInProgressRoot){
        commitRoot();
    }

    //如何任务没执行完
    //等待下一帧空闲时执行
    //注册事件
    window.requestIdleCallback(workLoop,{timeout:200});
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




