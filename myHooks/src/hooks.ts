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

interface Hook{
    memoizedState: any;
    baseState: any;
    baseQueue: UpdateQueue<any,any>|null;
    queue: any;
    next: Hook|null;
}



type Update<State,A> = {
    tag?: 0 | 1 | 2 | 3,
    payload?: any,
    callback?: Function,
    hasEagerState?: boolean,
    eagerState?: State | null,
    action:A,
    next: Update<State,A>
};

  
//action的精妙定义
type BasicStateAction<S> = (S)=> S | S;
type Dispatch<A> = (A)=> void;


type UpdateQueue<S,A> = {
    pending:Update<S,A>|null,
    /*
    baseState?: S,
    firstBaseUpdate?: Update<S,A>,
    lastBaseUpdate?: Update<S,A>,
    shared?: SharedQueue<S>,
    effects?: Array<Update<S,A>>,
    */
    lastRenderedReducer:(S,A)=>S|null;
    lastRenderedState:S|null;
    last:Update<S,A>;
    dispath:(A)=>S|null;
};
  
type SharedQueue<State>= {
    pending: Update<State,any>,
    interleaved: Update<State,any>,
    lanes: any;
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

function is(objA,objB){
    return JSON.stringify(objA) === JSON.stringify(objB);
}

function dispatchAction<A,State>(fiber:Fiber, queue:UpdateQueue<State,A>, action){
    /* 第一步：创建一个 update */
    const update: Update<any,A> = {
        action,
        next: null,
    };
    //pending有没待执行的任务
    const pending = queue.pending;
    //挂载第一个任务
    if (pending === null) {  /* 第一个待更新任务 */
        update.next = update;
    } else {  /* 已经有带更新任务 */
        //构建环状链表
        update.next = queue.pending;
        queue.pending.next = update;
    }
    queue.pending = update;


    const lastRenderedReducer = queue.lastRenderedReducer;
    const currentState = queue.lastRenderedState;                 /* 上一次的state */
    const eagerState = lastRenderedReducer(currentState, action); /* 这一次新的state */
    if (is(eagerState,currentState)) {                           /* 如果每一个都改变相同的state，那么组件不更新 */
       return 
    }
    scheduleUpdateOnFiber(fiber);   

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

    //初始化queue 为空 {}
    const queue: UpdateQueue<any,any> = {
        pending: null,
        dispath: null,
        last:null,
        lastRenderedReducer: basicStateReducer,
        //上一次的 state 
        lastRenderedState: initialState
    };

    //(hook.queue = {  }); // 负责记录更新的各种状态。
    
    const dispatch = (queue.dispatch = (dispatchAction.bind(null,currentlyRenderingFiber,queue))) // dispatchAction 为更新调度的主要函数 
    return [hook.memoizedState, dispatch];
}


//源码如此
function basicStateReducer<S>(state: S, action: BasicStateAction<S>): S {
    // $FlowFixMe: Flow doesn't like mixed types
    return typeof action === 'function' ? action(state) : action;
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

function  scheduleUpdateOnFiber(fiber){
    //开始调度
    //......
}