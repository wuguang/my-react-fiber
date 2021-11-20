interface Fiber {
    key:StaticRangeInit;
    props:any;
    stateNode?:HTMLElement|Function;
    child?:Fiber;
    sibling?:Fiber;
    return?:Fiber;
    memoizedState?:any;
    updateQueue:any;
}

interface Update{
    //正真需要更新的值，或者function
    action:any;
    eagerReducer: null;
    eagerState: null;
    next: Update;
}




//任务队列
interface queue{
    pending: any;
    dispatch:any;
    lastRenderedReducer:Function;
    lastRenderedState:Function;
}


interface Hook {
    memoizedState: any;
    baseState: any;
    baseQueue: queue|null;
    queue: queue|null;
    next: Hook;
}



let currentlyRenderingFiber:Fiber = null;
let ReactCurrentDispatcher = {
    current:null,
}
let workInProgressHook = null;


//初始化时用这个
const HooksDispatcherOnMount = { 
    useState: mountState,
    useEffect: mountEffect,
    useReducer:mountReducer,
}

const HooksDispatcherOnUpdate = {
    useState: updateState,
    useEffect: updateEffect,
    useReducer:updateReducer,
}

//useState 第一次，返回[value,setValue]
function mountState(initialState){

    //初始化当前hook
    const hook = mountWorkInProgressHook();
    //如果 useState 第一个参数为函数，执行函数得到初始化state
    if (typeof initialState === 'function') {
        initialState = initialState() 
    } 
    //初始化赋值
    hook.memoizedState = hook.baseState = initialState;

    const queue = (hook.queue = { ... }); // 负责记录更新的各种状态。
    
    const dispatch = (queue.dispatch = (dispatchAction.bind(  null,currentlyRenderingFiber,queue, ))) // dispatchAction 为更新调度的主要函数 
    return [hook.memoizedState, dispatch];
}

function mountEffect(){

}

function mountReducer(){

}






function updateState(initValue){

}

function updateEffect(){

}

function updateReducer(){

}



function mountWorkInProgressHook() {
    const hook:Hook = { memoizedState: null, baseState: null, baseQueue: null,queue: null, next: null};
    if (workInProgressHook === null) {  // 只有一个 hooks
        currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
    } else {  // 有多个 hooks
        workInProgressHook = workInProgressHook.next = hook;
    }
    return workInProgressHook;
}



/*
const  HooksDispatcherOnUpdate ={
   useState:updateState,
   useEffect: updateEffect,
   ...
}
*/

function renderWithHooks(current,workInProgress,Component,props){
    currentlyRenderingFiber = workInProgress;
    workInProgress.memoizedState = null; /* 每一次执行函数组件之前，先清空状态 （用于存放hooks列表）*/
    workInProgress.updateQueue = null;    /* 清空状态（用于存放effect list） */
    ReactCurrentDispatcher.current =  current === null || current.memoizedState === null ? HooksDispatcherOnMount : HooksDispatcherOnUpdate /* 判断是初始化组件还是更新组件 */
    //secondArg
    //暂时不关注
    //清空当前作用域 hook
    workInProgressHook = null;
    let children = Component(props);   /* 执行我们真正函数组件，所有的hooks将依次执行。 */
    //ReactCurrentDispatcher.current = ContextOnlyDispatcher;  /* 将hooks变成第一种，防止hooks在函数组件外部调用，调用直接报错。 */
}