

//特指该组件对应得fiber
//构造虚假fiber对象
let currentlyRenderingFiber$1 = {
    type:null,
    //状态 
    memoizedState:null,
    //指向已构建好的，另一个自己，
    //双缓冲
    alternate:null
};

function dispatchAction(fiber, queue, action) {
    //执行一次更新
    let update = {
        action: action,
        eagerReducer: null,
        eagerState: null,
        next: null
    };
    // Append the update to the end of the list.
    let pending = queue.pending;
    // 入环链表操作,queue 是updateQueue, 
    // lastEffectedQueue.lastEffect = queue？？
    if(pending === null){
        update.next = update;
    }else{
        /*
        意义解释:
        //2进1出
        let firstUpdate = pending.next;
        let lastUpdate = pending;
        update.next = firstUpdate;
        lastUpdate.next = update;
        queue.pending = update;
        */
        pending.next = update;
        update.next = pending.next; 
    }
    queue.pending = update;

    if( fiber === currentlyRenderingFiber$1 ){
        
    }else{
        const lastRenderedReducer = queue.lastRenderedReducer;
        //当前的状态
        const currentState = queue.lastRenderedState;  
        //期望更新后的状态,action是最后一次的             
        const eagerState = lastRenderedReducer(currentState, action); 
        let objectIs = typeof Object.is === 'function' ? Object.is : is;
        if (objectIs(eagerState, currentState)) {                           
           return 
        }    
    }
    // 发起调度更新
    scheduleUpdateOnFiber(fiber, expirationTime);   
}

function is(x, y) {
    return x === y && (x !== 0 || 1 / x === 1 / y) || x !== x && y !== y ;
}

function scheduleUpdateOnFiber(){

}


function mountState(initState) {
    if(typeof initState === 'function'){
        initState = initState();
    }

    return [initState,()=>{}];
}

function updateState(){
    return [];
}

function updateEffect(){
    return [];
}

function mountEffect(){
    return [];
}


let ReactCurrentDispatcher = {current:null};

let HooksDispatcherOnMount = {
    useState:mountState,
    useEffect:mountEffect
}
let HooksDispatcherOnUpdate = {
    useState:updateState,
    useEffect:updateEffect
}

if(currentlyRenderingFiber$1.alternate){
    ReactCurrentDispatcher.current = HooksDispatcherOnUpdate;
}else{
    ReactCurrentDispatcher.current = HooksDispatcherOnMount
}




//遵从react 原理的定义
function resolveDispatcher() {
    let dispatcher = ReactCurrentDispatcher.current;
    return dispatcher;
}


export function useState(initialState){
    const dispatcher = resolveDispatcher();
    return dispatcher.useState(initialState);
}

export function useEffect(create, deps){
    const dispatcher = resolveDispatcher();
    return dispatcher.useEffect(create, deps);
}


/*

export function useReducer<S, I, A>(
  reducer: (S, A) => S,
  initialArg: I,
  init?: I => S,
): [S, Dispatch<A>] {
  const dispatcher = resolveDispatcher();
  return dispatcher.useReducer(reducer, initialArg, init);
}

*/


/*
export default {
    useState:mountState,
    useEffect:mountEffect
};
*/