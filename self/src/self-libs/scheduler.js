import { TAG_ROOT, ELEMENT_TEXT, TAG_HOST, TAG_TEXT, PLACEMENT,DELETION ,UPDATE ,TAG_CLASS, TAG_FUNCTION_COMPONENT } from "./constants";
import { setProps } from './utils'
import { UpdateQueue,Update } from "./updateQueue";

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
    renderWithHooks(currentFiber.alternate||null,currentFiber,currentFiber.type,currentFiber.props);
    /*
    workInProgressFiber = currentFiber;
    hookIndex = 0;
    workInProgressFiber.hooks = [];
    const newChildren = [currentFiber.type(currentFiber.props)];
    reconcileChildren(currentFiber,newChildren);
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
    reconcileChildren(currentFiber,newChildren);
}

function updateHost(currentFiber) {
    if(!currentFiber.stateNode) {//如果此fiber没有创建DOM节点
        currentFiber.stateNode = createDom(currentFiber);
    }
    const newChildren = currentFiber.props.children||[];
    reconcileChildren(currentFiber,newChildren);
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
    reconcileChildren(currentFiber,newChildren);//reconcile协调
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

    let tag = getTagFromElement(newChild);
    let newFiber = null;
    //是dom节点
    if(currentFirstChild && currentFirstChild.type === newChild.type){
        //可复用fiber
        //第三次或以后
        //fiber 复用
        
        if(currentFirstChild.alternate){
            newFiber = currentFirstChild.alternate;

            newFiber = oldFiber.alternate;        
            newFiber.alternate = oldFiber;
            newFiber.effectTag = JSON.stringify({...oldFiber.props,children:null}) === JSON.stringify({...newChild.props,children:null}) ? null:UPDATE;
            newFiber.props = newChild.props;
            newFiber.updateQueue = oldFiber.updateQueue;
            newFiber.nextEffect = newFiber.firstEffect = newFiber.lastEffect = null;
        }else{
            //第二次
            //fiber对象需新建
            newFiber = getFiberFromOldFiber(currentFirstChild,newChild);
        }
    }else {
        //第一次更新
        //或新建fiber
        newFiber = createFiber(returnFiber,newChild);
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
function getFiberFromOldFiber(oldChildFiber,newChild){
    //flags
    
    let effectTag = null;
    if(typeof newChild.type === 'string'){
        effectTag = diffProperties(oldChildFiber,newChild)?null:UPDATE;
    } 

    return {
        tag:oldChildFiber.tag,
        type:oldChildFiber.type,
        props:newChild.props, //一定要新的
        stateNode:  oldChildFiber.stateNode,//div还没有创建DOM元素
        updateQueue: oldChildFiber.updateQueue,
        return: oldChildFiber.return,//父Fiber returnFiber
        alternate: oldChildFiber,//让新的fiber的alternate指向老的fiber
        effectTag:  JSON.stringify({...oldChildFiber.props,children:null}) === JSON.stringify({...newChild.props,children:null}) ? null:UPDATE,
        //副作用标示，render会收集副作用 增加 删除 更新
        nextEffect:null,//effect list也是一个单链表 顺序和完成顺序一样 节点可能会少
    }
}

function createFiber(returnFiber,newChild){
    return  {
        tag,
        type:   newChild.type,
        props:  newChild.props,
        stateNode:  null,//div还没有创建DOM元素
        return: returnFiber,//父Fiber returnFiber
        //updateQueue是挂载在fiber上的
        updateQueue: new UpdateQueue(),
        effectTag:  (typeof newChild.type === 'string')? PLACEMENT:null,//副作用标示，render会收集副作用 增加 删除 更新
        nextEffect:null,//effect list也是一个单链表 顺序和完成顺序一样 节点可能会少
    }
}

//父级与子级之间的关系
//构建子fiber但stateNode实例化
//调和的核心思想达到了
//同级子组件 key的对比
function reconcileChildren(returnFiber,newChildren){
    let oldReturnFiber = returnFiber.alternate||null;
    let currentFirstChild = oldReturnFiber && oldReturnFiber.child;
    let isObject = typeof newChildren === 'object' && newChildren !== null;
    //是单节点对象
    if(isObject){ 
        reconcileSingleElement(returnFiber,currentFirstChild,newChildren);
        return;
    }



    //子组件是数组时需要展开
    if(newChildren && Array.isArray(newChildren[0])){
        newChildren = newChildren[0];
    }

    let newChildIndex = 0;//新子节点的索引
    //如果说当前的currentFiber有alternate属性并且alternate有child属性
    //第二次渲染的时候 workInProgressRoot 有 alternate
    //而currentRoot还是第一次渲染的结果没有alternate
    let oldFiber = currentFiber.alternate && currentFiber.alternate.child;
    if(oldFiber) oldFiber.firstEffect = oldFiber.lastEffect = oldFiber.nextEffect = null;
    let prevSibiling;//上一个新的子fiber
    //遍历我们子虚拟DOM元素数组，为每一个虚拟DOM创建子Fiber
    while(newChildIndex < newChildren.length || oldFiber) {
        let newChild = newChildren[newChildIndex]; //取出虚拟DOM节点
        let newFiber;
        const sameType = oldFiber&&newChild&&oldFiber.type === newChild.type;

        let tag;
        if(newChild && typeof newChild.type == 'function' && newChild.type.prototype.isReactComponent){
            tag = TAG_CLASS;
        }else if(newChild && typeof newChild.type == 'function') {
            tag = TAG_FUNCTION_COMPONENT;
        }else if(newChild && newChild.type == ELEMENT_TEXT) {
            tag = TAG_TEXT;
        }else if(newChild && typeof newChild.type === 'string') {
            tag = TAG_HOST;//如果type是字符串，那么这是一个原生DOM节点div
        }
        if(sameType) { //说明老fiber和新虚拟DOM类型一样，可以复用，更新即可
            //关联指针 
            // 2个不同的fiber
            if(oldFiber.alternate) {//至少已经更新一次了
                newFiber = oldFiber.alternate;        
                newFiber.alternate = oldFiber;
                newFiber.effectTag = JSON.stringify({...oldFiber.props,children:null}) === JSON.stringify({...newChild.props,children:null}) ? null:UPDATE;
                newFiber.props = newChild.props;
                newFiber.updateQueue = oldFiber.updateQueue;
                newFiber.nextEffect = newFiber.firstEffect = newFiber.lastEffect = null;
            } else{
                //第二次，每个fiber 都更新？？
                //非常粗暴的比较方式
                newFiber = {
                    tag:oldFiber.tag,
                    type:oldFiber.type,
                    props:newChild.props, //一定要新的
                    stateNode:  oldFiber.stateNode,//div还没有创建DOM元素
                    updateQueue: oldFiber.updateQueue,
                    return: currentFiber,//父Fiber returnFiber
                    alternate: oldFiber,//让新的fiber的alternate指向老的fiber
                    effectTag:  JSON.stringify({...oldFiber.props,children:null}) === JSON.stringify({...newChild.props,children:null}) ? null:UPDATE,
                    //副作用标示，render会收集副作用 增加 删除 更新
                    nextEffect:null,//effect list也是一个单链表 顺序和完成顺序一样 节点可能会少
                }
            }
        }else{
            //创建子fiber
            if(newChild) { //看看新的DOM节点可有child（有可能是null）
                newFiber = {
                    tag,
                    type:   newChild.type,
                    props:  newChild.props,
                    stateNode:  null,//div还没有创建DOM元素
                    return: currentFiber,//父Fiber returnFiber
                    //updateQueue是挂载在fiber上的
                    updateQueue: new UpdateQueue(),
                    effectTag:  PLACEMENT,//副作用标示，render会收集副作用 增加 删除 更新
                    nextEffect:null,//effect list也是一个单链表 顺序和完成顺序一样 节点可能会少
                }
            }

            // 不相同，旧节点需要删除
            if(oldFiber) {
                oldFiber.effectTag = DELETION;
                deletions.push(oldFiber);
            }
        }
        
        if(oldFiber) {
            oldFiber = oldFiber.sibling; //oldFiber指针也向后移动一次,为了保持与下次对比
        }
        if(newFiber) {
            //构建父子关系，邻里关系
            if(newChildIndex == 0) {//如果索引是0，就是大儿子
                currentFiber.child = newFiber;
            }else {
                prevSibiling.sibling = newFiber;//大儿子指向弟弟
            }
            prevSibiling = newFiber;
        }
        newChildIndex++;
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

let currentlyRenderingFiber = null;
function renderWithHooks(current,workInProgress,Component,props){
    currentlyRenderingFiber = workInProgress;
    workInProgress.memoizedState = null; /* 每一次执行函数组件之前，先清空状态 （用于存放hooks列表）*/
    workInProgress.updateQueue = null;    /* 清空状态（用于存放effect list） */
    //ReactCurrentDispatcher.current =  current === null || current.memoizedState === null ? HooksDispatcherOnMount : HooksDispatcherOnUpdate /* 判断是初始化组件还是更新组件 */
    let children = Component(props, secondArg=null); /* 执行我们真正函数组件，所有的hooks将依次执行。 */
}

function mountWorkInProgressHook() {
    const hook = {  memoizedState: null, baseState: null, baseQueue: null,queue: null, next: null,};
    if (workInProgressHook === null) {  // 只有一个 hooks
      currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
    } else {  // 有多个 hooks
      workInProgressHook = workInProgressHook.next = hook;
    }
    return workInProgressHook;
  }

export function useEffect(createFn,deps,returnFn){

}



export function useReducer(reducer, initiaValue){

    let newHook = workInProgressFiber.alternate && workInProgressFiber.alternate.hooks
        && workInProgressFiber.alternate.hooks[hookIndex];
    if(newHook) {//第二次渲染 YODO
        newHook.state = newHook.updateQueue.forceUpdate(newHook.state);
    }else{
        newHook = {
            state: initiaValue,
            updateQueue: new UpdateQueue() //空的更新队列
        }
    }
    const dispatch = action => { //{type:'ADD'}
        let payload = reducer ? reducer(newHook.state, action) : action;
        newHook.updateQueue.enqueueUpdate(
            new Update(payload)
        );
        scheduleRoot();
    }

    workInProgressFiber.hooks[hookIndex++] = newHook;
    return [newHook.state, dispatch];
}

export function useState(initiaValue) {
    return useReducer(null, initiaValue);
}


//react询问浏览器是否空闲,这里有个优先级的概念 expirationTime
window.requestIdleCallback(workLoop,{timeout:500});






/*
let workInProgressHook = null;
let currentlyRenderingFiber = {};
function mountWorkInProgressHook() {
  const hook = {  memoizedState: null, baseState: null, baseQueue: null,queue: null, next: null,};
  if (workInProgressHook === null) {  // 只有一个 hooks
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  } else {  // 有多个 hooks
     _workInProgressHook = workInProgressHook;
     while(_workInProgressHook.next) {
          _workInProgressHook = _workInProgressHook.next;
     }
     _workInProgressHook.next = hook;
  }
  return workInProgressHook;
}
*/
