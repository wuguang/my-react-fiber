import ReactDom from './react-dom.js';

//特指该组件对应得fiber
//构造虚假fiber对象
let currentlyRenderingFiber$1 ={
	type:null,
	//状态 
	memoizedState:null,
	//指向已构建好的，另一个自己，
	//双缓冲
	alternate:null
};
//当前正在使用的hook,全局对象
let workInProgressHook = null;
let ReactCurrentDispatcher = {current:null};



export function updateFiber(type){

	currentlyRenderingFiber$1.type = type;
	currentlyRenderingFiber$1.alternate = currentlyRenderingFiber$1;
	//更新dispater指向
	reactCurrentDispatcherinit();

	workInProgressHook = null;
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
    scheduleUpdateOnFiber(fiber);   
}

function is(x, y) {
    return x === y && (x !== 0 || 1 / x === 1 / y) || x !== x && y !== y ;
}

function scheduleUpdateOnFiber(){
	//发起调度
	//1)异步执行
	//2)
	ReactDom.render();
}


//new 一个 hook
function mountWorkInProgressHook() {
    let hook = {
        memoizedState: null,
        baseState: null,
        baseQueue: null,
        queue: null,
        next: null
    };

    if (workInProgressHook === null) {
        //初始化挂载hook
        currentlyRenderingFiber$1.memoizedState = hook;
        workInProgressHook = hook;
    } else {
        //跟新hook链表
        workInProgressHook.next = hook;
        workInProgressHook = hook;
    }
    //返回当前hook
    return workInProgressHook;
}

//base reducer
function basicStateReducer(state, action) {
    return typeof action === 'function' ? action(state) : action;
}

function mountState(initialState) {
    let hook = mountWorkInProgressHook();
    if(typeof initialState === 'function'){
      initialState = initialState();
    }
    //初始化
    hook.memoizedState  = initialState;
    hook.baseState = initialState;
    // 每个hook自己的 queue,queue第一次初始化，为什么要queue? ，state更新的队列
    // 多次调用 setState方法
    let queue =  {
        pending: null,
        dispatch: null,
        lastRenderedReducer: basicStateReducer,
        lastRenderedState: initialState
    };
    hook.queue = queue;

    let dispatch = queue.dispatch = dispatchAction.bind(null, currentlyRenderingFiber$1, queue);
    return [hook.memoizedState, dispatch];
}

//update时，获取上次的hook
//上次的第一个hook
let currentHook = null;
function updateWorkInProgressHook() {
	//这里和源码逻辑不一致...
    if(workInProgressHook === null){
		workInProgressHook = currentlyRenderingFiber$1.memoizedState;
		//上一次 第一个hook
		currentHook = currentlyRenderingFiber$1.alternate.memoizedState;
	}else{
		//取下一个
		workInProgressHook = workInProgressHook.next;
		//上个fiber上引用hook
		currentHook = currentHook.next;
	}
    return workInProgressHook;
}

function updateReducer(reducer, initialArg, init) {
    let hook = updateWorkInProgressHook();
    let queue = hook.queue;
	//更新上次的reducer！！！
	//挡前hook的queue
    queue.lastRenderedReducer = reducer;

    let current = currentHook; // The last rebase update that is NOT part of the base state.
    let baseQueue = current.baseQueue; // The last pending update that hasn't been processed yet.
    let pendingQueue = queue.pending;

    if (pendingQueue !== null) {
      // We have new updates that haven't been processed yet.
      // We'll add them to the base queue.
      if (baseQueue !== null) {
        // Merge the pending queue and the base queue.
        var baseFirst = baseQueue.next;
        var pendingFirst = pendingQueue.next;
        baseQueue.next = pendingFirst;
        pendingQueue.next = baseFirst;
      }

      {
        if (current.baseQueue !== baseQueue) {
          // Internal invariant that should never happen, but feasibly could in
          // the future if we implement resuming, or some form of that.
          error('Internal error: Expected work-in-progress queue to be a clone. ' + 'This is a bug in React.');
        }
      }

      current.baseQueue = baseQueue = pendingQueue;
      queue.pending = null;
    }

    if (baseQueue !== null) {
      // We have a queue to process.
      var first = baseQueue.next;
      var newState = current.baseState;
      var newBaseState = null;
      var newBaseQueueFirst = null;
      var newBaseQueueLast = null;
      var update = first;

      do {
        var updateLane = update.lane;

        if (!isSubsetOfLanes(renderLanes, updateLane)) {
          // Priority is insufficient. Skip this update. If this is the first
          // skipped update, the previous update/state is the new base
          // update/state.
          var clone = {
            lane: updateLane,
            action: update.action,
            eagerReducer: update.eagerReducer,
            eagerState: update.eagerState,
            next: null
          };

          if (newBaseQueueLast === null) {
            newBaseQueueFirst = newBaseQueueLast = clone;
            newBaseState = newState;
          } else {
            newBaseQueueLast = newBaseQueueLast.next = clone;
          } // Update the remaining priority in the queue.
          // TODO: Don't need to accumulate this. Instead, we can remove
          // renderLanes from the original lanes.


          currentlyRenderingFiber$1.lanes = mergeLanes(currentlyRenderingFiber$1.lanes, updateLane);
          markSkippedUpdateLanes(updateLane);
        } else {
          // This update does have sufficient priority.
          if (newBaseQueueLast !== null) {
            var _clone = {
              // This update is going to be committed so we never want uncommit
              // it. Using NoLane works because 0 is a subset of all bitmasks, so
              // this will never be skipped by the check above.
              lane: NoLane,
              action: update.action,
              eagerReducer: update.eagerReducer,
              eagerState: update.eagerState,
              next: null
            };
            newBaseQueueLast = newBaseQueueLast.next = _clone;
          } // Process this update.


          if (update.eagerReducer === reducer) {
            // If this update was processed eagerly, and its reducer matches the
            // current reducer, we can use the eagerly computed state.
            newState = update.eagerState;
          } else {
            var action = update.action;
            newState = reducer(newState, action);
          }
        }

        update = update.next;
      } while (update !== null && update !== first);

      if (newBaseQueueLast === null) {
        newBaseState = newState;
      } else {
        newBaseQueueLast.next = newBaseQueueFirst;
      } // Mark that the fiber performed work, but only if the new state is
      // different from the current state.


      if (!objectIs(newState, hook.memoizedState)) {
        markWorkInProgressReceivedUpdate();
      }

      hook.memoizedState = newState;
      hook.baseState = newBaseState;
      hook.baseQueue = newBaseQueueLast;
      queue.lastRenderedState = newState;
    }

    var dispatch = queue.dispatch;
    return [hook.memoizedState, dispatch];
}

function updateState(initialState) {
    return updateReducer(basicStateReducer);
}

function updateEffect(){
    return [];
}

function mountEffect(){
    return [];
}




let HooksDispatcherOnMount = {
    useState:mountState,
    useEffect:mountEffect
}
let HooksDispatcherOnUpdate = {
    useState:updateState,
    useEffect:updateEffect
}

function reactCurrentDispatcherinit(){
	if(currentlyRenderingFiber$1.alternate){
		ReactCurrentDispatcher.current = HooksDispatcherOnUpdate;
	}else{
		ReactCurrentDispatcher.current = HooksDispatcherOnMount
	}
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

//自定义的
reactCurrentDispatcherinit();


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