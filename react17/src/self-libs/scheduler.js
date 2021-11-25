import { TAG_ROOT, ELEMENT_TEXT, TAG_HOST, TAG_TEXT, PLACEMENT,DELETION ,UPDATE ,TAG_CLASS, TAG_FUNCTION_COMPONENT } from "./constants";
import { setProps } from './utils'
import { UpdateQueue,Update } from "./updateQueue";
import {renderWithHooks,useState,useEffect,useReducer} from './hooks';

let nextUnitOfWork = null; //下一个工作单元
let workInProgressRoot = null;//RootFiber应用的根
let workInProgressFiber = null; //正在工作中的fiber
let currentRoot = null; //渲染成功后的当前根rootFiber
let deletions = []; //删除的节点不放在effect list 要单独记录并执行
let hookIndex = 0; //hooks索引

/**
 * 从根节点开始渲染和调度
 * 两个阶段（diff+render阶段，commit阶段）
 * diff+render阶段 对比新旧虚拟DOM，进行增量更新或创建
 * 花时间长，可进行任务拆分，此阶段可暂停
 * render阶段的成果是effect list知道哪些节点更新哪些节点增加删除了
 * render阶段两个任务1.根据虚拟DOM生成fiber树 2.收集effectlist
 * commit阶段，进行DOM更新创建阶段，此间断不能暂停
 * @param {tag:TAG_ROOT,stateNode:container,props:{children:[element]} rootFiber 
 **/

//更节点容器 rootFiber
//赋值操作
//workInProgressRoot
//nextUnitOfWork

export function scheduleRoot(rootFiber) {
    if(currentRoot && currentRoot.alternate) { //这就是第二次之后渲染，不能每次都创建树，如起始时可以把第一个树赋给第三个
        workInProgressRoot = currentRoot.alternate;
        workInProgressRoot.alternate = currentRoot;//他的替身指向当前树
        if(rootFiber) workInProgressRoot.props = rootFiber.props;//让他的props更新成新的props
    }else if(currentRoot) {//第一次更新
        if(rootFiber) {
            rootFiber.alternate = currentRoot;
            workInProgressRoot = rootFiber;
        }else{
            //第一次添加 alternate
            workInProgressRoot = {
                ...currentRoot,
                alternate:currentRoot
            }
        }
    }else{//如果是第一次渲染
        // 第一次入口
        workInProgressRoot = rootFiber;
    }

    //清空指针
    workInProgressRoot.firstEffect = workInProgressRoot.lastEffect = workInProgressRoot.nextEffect = null;
    //第一个工作单元
    //fiber 存储了关于该节点所有信息 以及上下节点的指针
    nextUnitOfWork = workInProgressRoot;
}


//fiber 分割任何的核心流程
function performUnitOfWork(currentFiber) {
    beginWork(currentFiber);
    if(currentFiber.child) {
        return currentFiber.child; //有孩子返回孩子
    }
    while(currentFiber) {
        completeUnitOfWork(currentFiber);
        if(currentFiber.sibling) {
            return currentFiber.sibling; //有弟弟返回弟弟
        }
        currentFiber = currentFiber.return; //返回父亲
    }
    return null; // 至到 workInProgressRoot,此时没有return;
}

/**
 * 在完成时收集副作用 组成effect list
 * 每个fiber有两个属性 firstEffect指向第一个有副作用的子fiber 
 * lastEffect指向最后一个有副作用的子fiber，中间用nextEffect做成单链表
 * @param {*} currentFiber 
 */
function completeUnitOfWork(currentFiber) {
    let returnFiber = currentFiber.return;
    //最后一个跟节点没有 return 没有父节点，自己就是父节点
    
    if(returnFiber) {
        //如果当前currentFiber有effectList的话
        //currentFiber.firstEffect /lastEffect
        //先的自身的effectList传递出去
        //myCode
        if(currentFiber.firstEffect && currentFiber.lastEffect) {
            if(!returnFiber.firstEffect){
                returnFiber.firstEffect = currentFiber.firstEffect;
            }else{
                returnFiber.lastEffect.nextEffect = currentFiber.firstEffect;
            }
            returnFiber.lastEffect = currentFiber.lastEffect;
        }
        
        /*
        if(!returnFiber.firstEffect) {
            returnFiber.firstEffect = currentFiber.firstEffect;
        }
        if(currentFiber.lastEffect) {
            if(returnFiber.lastEffect){
                returnFiber.lastEffect.nextEffect = currentFiber.firstEffect;
            }
            returnFiber.lastEffect = currentFiber.lastEffect;
        }
        */

        const effectTag = currentFiber.effectTag;
        if(effectTag){ //如果有副作用，（第一次时肯定有，新增默认PLACEMENT）
            //当前effectTag 收复到父组件上
            if(returnFiber.lastEffect){
                returnFiber.lastEffect.nextEffect = currentFiber;
            }else{
                returnFiber.firstEffect = currentFiber;
            }
            returnFiber.lastEffect = currentFiber;
        }
    }
}

/**
 * beginWork开始遍历每一个节点
 * 
 * 1.创建真实DOM元素
 * 2.创建子fiber
 * @param {*} currentFiber 
 */
function beginWork(currentFiber) {
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

function updateFunctionComponent(currentFiber) {
    //需在renderWidthHooks里执行
    //renderWithHooks(currentFiber.alternate||null,currentFiber,currentFiber.type,currentFiber.props);
    workInProgressFiber = currentFiber;
    let newChildren = renderWithHooks(currentFiber.alternate,workInProgressFiber,currentFiber.type,currentFiber.props);
    reconcileChildFibers(currentFiber,newChildren);
    //提前执行  !!!!
    if(workInProgressFiber.updateQueue && workInProgressFiber.updateQueue.lastEffect){
        let preFristEffect = currentFiber && currentFiber.updateQueue.lastEffect.next;
        let preNextEffect = preFristEffect;
        let firstEffect = workInProgressFiber.updateQueue.lastEffect.next;
        let nextEffect = firstEffect;

        do{
            let {create,destroy,deps} = nextEffect;
            //对比 deps 不同即执行
            if(!is(deps,preNextEffect.deps)){
                //执行useEffect内容
                //effect里有dispater更新状态等等
                nextEffect.destroy = create();
            }
            //effect是一一对应的
            nextEffect = nextEffect.next;
            preNextEffect = nextEffect.next;
        }while(firstEffect !== nextEffect);

        //执行updateState
        let firstHook = workInProgressFiber.memoizedState;
        let queue = Hook.queue.pending;

        //执行




        /*
        if(firstEffect !== nextEffect){
            nextEffect = nextEffect.next;
        }
        */
    }

    //执行 function component 的effect hook effect等等；
    /*
    hookIndex = 0;
    workInProgressFiber.hooks = [];
    const newChildren = [currentFiber.type(currentFiber.props)];
    reconcileChildFibers(currentFiber,newChildren);
    */

}

function updateClassComponent(currentFiber) {
    if(!currentFiber.stateNode) { //类组件 stateNode是组件的实例
        //new ClassCounter();类组件 fiber双向指向
        currentFiber.stateNode = new currentFiber.type(currentFiber.props);
        currentFiber.stateNode.internalFiber = currentFiber;
        //初始化队列
        currentFiber.updateQueue = new UpdateQueue();//更新队列
    }
    //给组件的实例state赋值
    //将任务合并 一次性更新
    currentFiber.stateNode.state = currentFiber.updateQueue.forceUpdate(currentFiber.stateNode.state);
    let newElement = currentFiber.stateNode.render();
    const newChildren = [newElement];
    reconcileChildFibers(currentFiber,newChildren);
}

function updateHost(currentFiber) {
    if(!currentFiber.stateNode) {//如果此fiber没有创建DOM节点
        currentFiber.stateNode = createDom(currentFiber);  
    }
    //文本节点就不用调和了
    let childVal =  currentFiber.props.children;
    let typeChild = typeof childVal;
    if(typeChild === 'string' || typeChild === 'number' ){
        if(currentFiber.effectTag){
            currentFiber.stateNode.textContent = currentFiber.props.children + '';
        }
        return;
    }

    let newChildren = [];
    
    if(!Array.isArray(currentFiber.props.children)){
        return;
    }
    //currentFiber.props.children||[];
    currentFiber.props.children.forEach(item=>{
        if(typeof item === 'string' ){
            if(item.trim()){
                newChildren.push(item);
            }
        }else{
            newChildren.push(item);
        }
    });
    //过滤 杂项
    currentFiber.props.children = newChildren;
    reconcileChildFibers(currentFiber,newChildren);
}

function updateHostText(currentFiber) {
    if(!currentFiber.stateNode) {//如果此fiber没有创建DOM节点
        currentFiber.stateNode = createDom(currentFiber);
    }
}


function createDom(currentFiber) {
    if(currentFiber.tag === TAG_TEXT) {
        return document.createTextNode(currentFiber.props.text);
    }else if(currentFiber.tag === TAG_HOST) {
        let stateNode = document.createElement(currentFiber.type);
        updateDOM(stateNode,{},currentFiber.props);
        return stateNode;
    }
}

function updateDOM(stateNode,oldProps,newProps) {
    //只需要更新属性
    if(stateNode && stateNode.setAttribute) {
        setProps(stateNode,oldProps,newProps);
    }
}

function updateHostRoot(currentFiber) {
    //先处理自己 如果是一个原生节点，创建真实DOM 2.创建子fiber
    let newChildren = currentFiber.props.children;//[element]
    reconcileChildFibers(currentFiber,newChildren);//reconcile协调
}

//新的element 定义tag
/*
真是的react 有 
type


$$typeof,
tag,
elmentType

*/
function getTagFromElement(newChild){
    let tag = '';
    if(typeof newChild.type == 'function' && newChild.type.prototype.isReactComponent){
        tag = TAG_CLASS;
    }else if(typeof newChild.type == 'function') {
        tag = TAG_FUNCTION_COMPONENT;
    }else if(newChild.type == ELEMENT_TEXT) {
        tag = TAG_TEXT;
    }else if(typeof newChild.type === 'string') {
        tag = TAG_HOST;//如果type是字符串，那么这是一个原生DOM节点div
    }
    return tag;
}


// 胆子节点调和
function reconcileSingleElement(returnFiber,currentFirstChild,newChild){
    //newChild 是单个
    //current.children不一定是单个
    //一个已知单节点对一个未知类型的 比较
    //简单粗暴法,类型是否一致，属性
    let newChildFiber = null;
    //是dom节点
    if(currentFirstChild && currentFirstChild.type === newChild.type){
        //可复用fiber
        //第三次或以后
        //fiber 复用
        if(currentFirstChild.alternate){
            newChildFiber = useOldFiber(currentFirstChild,newChild,0);
        }else{
            //第二次
            //fiber对象需新建
            newChildFiber = getFiberFromOldFiber(currentFirstChild,newChild,0);
        }
        returnFiber.child = newChildFiber;

        //删除其他 oldFibers 如果有的话
        deleteRemainingChildren(returnFiber.alternate, currentFirstChild);
    }else {
        //第一次更新
        //或新建fiber
        newChildFiber = createFiber(returnFiber,newChild,0);
        returnFiber.child = newChildFiber;
    }
}


function deleteRemainingChildren(returnFiber,exceptOne){
    let firstChild = returnFiber.child;
    //排除这个exceptOne
    if(firstChild !== exceptOne){
        deletions.push(firstChild);
    }
    let siblingFiber = firstChild.siblingFiber;
    while(siblingFiber){
        if(siblingFiber !== exceptOne){
            deletions.push(siblingFiber);
        }
        siblingFiber = siblingFiber.sibling;
    }
}

function diffProperties(oldChildFiber,newChild){
    //JSON.stringify({...oldChildFiber.props,children:null}) === JSON.stringify({...newChild.props,children:null}) ? null:UPDATE,
    //先比较key是否一致
    if(JSON.stringify(Object.keys(oldChildFiber.props)) !== JSON.stringify(Object.keys(newChild.props))){
        return false;
    }else{
        for(let k in oldChildFiber.props){
            if(oldChildFiber.props[k] !== newChild.props[k]){
                return false;
            }
        }
    }
    return true;
}

//第一次 也是新建fiber
//建立双缓存
function getFiberFromOldFiber(oldChildFiber,newChild,index){
    //flags
    let effectTag = null;
    if(typeof newChild.type === 'string'){
        effectTag = diffProperties(oldChildFiber,newChild)?null:UPDATE;
    }
    let newFiber_02 = {
        key:newChild.key||index,
        tag:oldChildFiber.tag,
        type:oldChildFiber.type,
        props:newChild.props, //一定要新的
        stateNode:  oldChildFiber.stateNode,//div还没有创建DOM元素
        updateQueue: oldChildFiber.updateQueue,
        return: oldChildFiber.return,//父Fiber returnFiber
        alternate: oldChildFiber,//让新的fiber的alternate指向老的fiber
        effectTag:  effectTag,
        //副作用标示，render会收集副作用 增加 删除 更新
        nextEffect:null,//effect list也是一个单链表 顺序和完成顺序一样 节点可能会少
        index:index,
    }

    return newFiber_02;
}

function createFiber(returnFiber,newChild,index){
    let tag = getTagFromElement(newChild);
    return  {
        tag,
        type:newChild.type,
        props:newChild.props,
        index:index,
        key:newChild.key||index,
        stateNode:  null,//div还没有创建DOM元素
        return: returnFiber,//父Fiber returnFiber
        //updateQueue是挂载在fiber上的
        updateQueue: new UpdateQueue(),
        effectTag: (typeof newChild.type === 'string')? PLACEMENT:null,//副作用标示，render会收集副作用 增加 删除 更新
        nextEffect:null,//effect list也是一个单链表 顺序和完成顺序一样 节点可能会少
    }
}

function useOldFiber(oldChildFiber,newChild,index){
    let newFiber = null;
    let effectTag = null;
    if(typeof newChild.type === 'string'){
        effectTag = diffProperties(oldChildFiber,newChild)?null:UPDATE;
    } 
    newFiber = oldChildFiber.alternate;
    newFiber.alternate = oldChildFiber;
    newFiber.effectTag = effectTag;
    newFiber.props = newChild.props;
    newFiber.updateQueue = oldChildFiber.updateQueue;
    newFiber.nextEffect = newFiber.firstEffect = newFiber.lastEffect = null;
    newFiber.index = index;
    newFiber.key = newChild.key ||index;

    return newFiber;
}


//数组节点 调和
//节点复用

function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren){
    let newIndex = 0; //
    let oldReturnFiber = returnFiber.alternate;
    let oldChildFiber = (oldReturnFiber && oldReturnFiber.child) ||null;
    let newChild = newChildren[newIndex];
    let prevNewFiber = null;

    let oldIndex = null;
    let lastPlacedIndex = 0; 

    // 第一轮 循环
    // 新旧二者必须都存在，且类型相同
    // tag

    let newTag = getTagFromElement(newChild);
    //校验 newChildren 是否有 key
    //validChildrenKeys();
    while(newChild && oldChildFiber){
        newChild.key = newChild.key||newIndex;
        //相同可以复用fiber
        if(newChild.key === oldChildFiber.key && newTag === oldChildFiber.tag){
            let newChildFiber03 = {};
            if(oldChildFiber.alternate){
                //直接复用
                newChildFiber03 = useOldFiber(oldChildFiber,newChild,newIndex);
            }else{
                //flags
                //缓冲
                newChildFiber03 = getFiberFromOldFiber(oldChildFiber,newChild,newIndex);
                console.log(`newFiber=${newChildFiber03}`);
            }
            //newChildFiber03 ={age:'18'};
            lastPlacedIndex = newIndex; 
            if(newIndex ===0){
                returnFiber.child = newChildFiber03;
            }else{
                prevNewFiber.sibling = newChildFiber03;
            }
            prevNewFiber = newChildFiber03;
            //进行下次循环
            newIndex ++;
            newChild = newChildren[newIndex]
            oldChildFiber = oldChildFiber.sibling;
        }else{
            //2个都没循环完
            //第一轮循环终止,进行下一次循环
            //newIndex 终止索引
            break;
        }
    }

    //新children遍历完毕了
    if(newIndex === newChildren.length){
        //如果 oldReturnFiber 还有子节点，则全部删除
        deleteRemainingChildren(returnFiber,oldChildFiber);
        //结束本次调和
        return;
    //老节点遍历完了
    //新节点全部new出来
    }else if(oldChildFiber === null){
        //剩余的new children继续循环 全部newFiber
        for(let len=newChildren.length; newIndex<len; newIndex++){
            let newChildFiber02 = null;
            newChildFiber02 = createFiber(returnFiber,newChildren[newIndex],newIndex);
            if(newIndex === 0){
                returnFiber.child = newChildFiber02;
            }
            newChildFiber02.return = returnFiber;
            if(prevNewFiber){
                prevNewFiber.sibling = newChildFiber02;
            }
            prevNewFiber = newChildFiber02;
        }
        //结束本次调和
        return;
    }

    //第二轮循环
    //1、 old 建立map
    let oldFiberMap = new Map();
    //将剩余的oldFiber 集合，合成Map
    while(oldChildFiber){
        //以key或索引为key
        oldFiberMap.set(oldChildFiber.key,oldChildFiber);
        oldChildFiber = oldChildFiber.sibling;
    }
    let newChildFiber = null;

    //新节点还存在!!
    //从map里找
    while(newChild){
        if(oldFiberMap.has(newChild.props.key)){
            oldChildFiber = oldFiberMap.get(newChild.props.key);
            if(oldChildFiber.alternate){
                //直接复用
                newChildFiber = useOldFiber(oldChildFiber,newChild,newIndex);
            }else{
                //新建复用
                newChildFiber = getFiberFromOldFiber(oldChildFiber,newChild,newIndex);
            }
            oldIndex = oldChildFiber.index;
            if(oldIndex<lastPlacedIndex){
                //就节点需要往右移动
                //this is move
                //how to move I don't know ~~
                //newChildFiber.effectTag = PLACEMENT;
                //lastPlacedIndex = oldIndex;
                //oldFiberMap.find()

                removeNodeForDiff(oldChildFiber,oldReturnFiber,lastPlacedIndex);
            }else{
                //重置 lastPlacedIndex的值
                lastPlacedIndex = oldIndex;
            }
        }else{
            newChildFiber = createFiber(returnFiber,newChild,newIndex);
        }

        newChildFiber.return = returnFiber;
        if(prevNewFiber){
            prevNewFiber.sibling = newChildFiber;
        }
    
        //继续循环
        prevNewFiber = newChildFiber;
        newIndex ++;
        newChild = newChildren[newIndex];
        
    
    }
    // 2、
}

function removeNodeForDiff(oldChildFiber,oldReturnFiber,lastPlacedIndex){

    let lastPlacedFiber = oldReturnFiber.child;
    if(oldChildFiber.tag === TAG_HOST){
        while(lastPlacedFiber){
            if(lastPlacedFiber.index === lastPlacedIndex){
                break;
            }else{
                lastPlacedFiber = lastPlacedFiber.sibling;
            }
        }
        let lastPlacedDomFiber =  findDomFiberFromLinkedKey(lastPlacedFiber,'child'); 
        let oldReturnDomFiber = findDomFiberFromLinkedKey(oldReturnFiber,'return');
        //移动dom节点
        //临时处理的方案
        oldReturnDomFiber.stateNode.insertBefore(oldChildFiber.stateNode,lastPlacedDomFiber.stateNode);
    }
}


function findDomFiberFromLinkedKey(fiber,linkedKey){
    let targetFiber = fiber;
    while(targetFiber){
        if(targetFiber.tag === TAG_HOST){
            break;
        }else{
            targetFiber = targetFiber[linkedKey];
        }
    }
    return targetFiber;
}

//父级与子级之间的关系
//构建子fiber但stateNode实例化
//调和的核心思想达到了
//同级子组件 key的对比
function reconcileChildFibers(returnFiber,newChildren){
    let oldReturnFiber = returnFiber.alternate||null;
    let currentFirstChild = (oldReturnFiber && oldReturnFiber.child)||null
    let isObject =  (Array.isArray(newChildren) && newChildren.length === 1 && typeof newChildren[0] === 'object');
    //(typeof newChildren === 'object' && newChildren !== null)
    
    //是单节点对象
    if(isObject){ 
        newChildren = newChildren[0];
        reconcileSingleElement(returnFiber,currentFirstChild,newChildren);
        return;
    }else if(Array.isArray(newChildren)){
        reconcileChildrenArray(returnFiber, currentFirstChild, newChildren);
    }
}

/**
 * 回调返回浏览器空闲时间，判断是否继续执行任务
 * @param {*} deadline 
 */
function workLoop(deadline) {
    let shouldYield = false; //react是否要让出时间或说控制权

    //render阶段
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1;
    }

    //commit阶段必须是同步的一次性的
    if(!nextUnitOfWork && workInProgressRoot) {
        // console.log('render阶段结束');
        commitRoot();
    }
    
    //每一帧都要执行这个代码
    window.requestIdleCallback(workLoop,{ timeout : 500});
}

function commitRoot() {

    //deletions需要单独处理
    //这些是需要删除的节点
    deletions.forEach(commitWork);//执行 effect list之前先把该删除的元素删除
    //所有的effectList都挂载在workInprogressRoot.firstEffect上

    let currentFiber =  workInProgressRoot.firstEffect;
    //处理dom节点
    while(currentFiber) {
        commitWork(currentFiber);
        currentFiber = currentFiber.nextEffect;
    }

    deletions.length = 0;//提交后清空deletions数组
    //交换赋值给  currentRoot
    currentRoot = workInProgressRoot; //把当前渲染成功的根fiber 赋给currentRoot
    //这里没有指针???????
    //currentRoot.alternate = workInProgressRoot;
    workInProgressRoot = null;
}

function commitWork(currentFiber) {
    if(!currentFiber) return;
    //currentFiber.type === 

    let returnFiber = currentFiber.return;
    
    while(returnFiber.tag !== TAG_HOST && 
        returnFiber.tag !== TAG_ROOT &&
        returnFiber.tag !== TAG_TEXT ) {
        
        returnFiber = returnFiber.return;
    }
    //找真实的dom父节点
    let domReturn = returnFiber.stateNode;

    //通过effectTag 决定 怎么处理
    if(currentFiber.effectTag === PLACEMENT) {//处理新增节点
        let nextFiber = currentFiber;
        //这里不能返回吧！！！！！
        //后续跟进
        if(nextFiber.tag === TAG_CLASS) {
            return;
        }
        //如果要挂载的节点不是dom节点，比如说是类组件fiber，一直找第一个儿子，直到找到真实DOM
        //一定会找到!!! nextFiber怎么会没有呢
        while (nextFiber && nextFiber.tag !== TAG_HOST && 
            nextFiber.tag !== TAG_TEXT ) {
                nextFiber = currentFiber.child;
            }
        
        if(nextFiber && nextFiber.stateNode){
            domReturn.appendChild(nextFiber.stateNode);
        }
    }else if(currentFiber.effectTag === DELETION) {//删除节点
        return commitDeletion(currentFiber,domReturn);
    }else if(currentFiber.effectTag === UPDATE) {
        if(currentFiber.type === ELEMENT_TEXT) {
            //currentFiber.alternate 指向对应的旧的文本节点
            //后续跟进
            if(currentFiber.alternate.props.text != currentFiber.props.text){
                currentFiber.stateNode.textContent = currentFiber.props.text;
            }
        }else{
            //没有确认currentFiber.effectTag是否存在 TAG_HOST
            updateDOM(currentFiber.stateNode,currentFiber.alternate.props,currentFiber.props)
        }
    }
    //清除tag
    currentFiber.effectTag = null;
    //清空
}

function commitDeletion(currentFiber,domReturn) {
    //myCode
    // 找真实的 currentFiber dom
    while(currentFiber && currentFiber.tag !== TAG_HOST && currentFiber.tag !== TAG_TEXT){
        currentFiber = currentFiber.child;
    }
    let currentFiberDom = currentFiber.stateNode;
    if(domReturn && currentFiberDom){
        domReturn.removeChild(currentFiber.stateNode);
    }
    /*
    if(currentFiber.tag == TAG_HOST || currentFiber.tag == TAG_TEXT){
        domReturn.removeChild(currentFiber.stateNode);
    }else{
        commitDeletion(currentFiber.child,domReturn);
    }
    */
}


//react询问浏览器是否空闲,这里有个优先级的概念 expirationTime
window.requestIdleCallback(workLoop,{timeout:500});


