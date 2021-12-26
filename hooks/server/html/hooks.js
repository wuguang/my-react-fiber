import ReactDom from './react-dom.js';

var NoFlags$1 = 0;
// Represents whether effect should fire.

var HasEffect = 1;

// Represents the phase in which the effect (not the clean-up) fires.

var Layout = 2;

var Passive$1 = 4;


//特指该组件对应得fiber
//构造虚假fiber对象
let currentlyRenderingFiber$1 ={
	type:null,
	//状态 
	memoizedState:null,
	//指向已构建好的，另一个自己，
	//双缓冲
	alternate:null,
    updateQueue: null,
};
//当前正在使用的hook,全局对象
let workInProgressHook = null;
let ReactCurrentDispatcher = {current:null};
let objectIs = typeof Object.is === 'function' ? Object.is : is;

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

//执行effect
//更新updateQueue 等等
//准备第一次更新
function commitRoot(){
    //effect是否要执行
    //hook.queue 是否要更新
    //此hook为hook链表
    //参见20591
    //function commitHookEffectListMount(finishedWork) {
    // 异步执行 Effect
    //微任务 异步执行fiber_Effect_List
    setTimeout(()=>{
        commitHookEffectListMount(currentlyRenderingFiber$1);
    },0);
    //执行副作用  
}

//执行副作用 EffectList
function commitHookEffectListMount( finishedWork) {
    let tag = Layout | HasEffect;
    let updateQueue = finishedWork.updateQueue;
    let lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;

    if (lastEffect !== null) {
        let firstEffect = lastEffect.next;
        let effect = firstEffect;

        do {
            //effet 的tag 是否包含 tag 
            if ((effect.tag & tag) === tag) {
            // Mount
            let create = effect.create;
            //执行 回调
            effect.destroy = create();
                //destroy 的报错信息
                {
                    let destroy = effect.destroy;
                    if (destroy !== undefined && typeof destroy !== 'function') {
                        let addendum = void 0;

                        if (destroy === null) {
                            addendum = ' You returned null. If your effect does not require clean ' + 'up, return undefined (or nothing).';
                        } else if (typeof destroy.then === 'function') {
                            addendum = '\n\nIt looks like you wrote useEffect(async () => ...) or returned a Promise. ' + 'Instead, write the async function inside your effect ' + 'and call it immediately:\n\n' + 'useEffect(() => {\n' + '  async function fetchData() {\n' + '    // You can await here\n' + '    const response = await MyAPI.getData(someId);\n' + '    // ...\n' + '  }\n' + '  fetchData();\n' + "}, [someId]); // Or [] if effect doesn't need props or state\n\n" + 'Learn more about data fetching with Hooks: https://reactjs.org/link/hooks-data-fetching';
                        } else {
                            addendum = ' You returned: ' + destroy;
                        }

                        error('An effect function must not return anything besides a function, ' + 'which is used for clean-up.%s', addendum);
                    }
                }
            }
            effect = effect.next;
        } while (effect !== firstEffect);
    }
}

let isScheduleUpdateing = false;
function scheduleUpdateOnFiber(tag){
    //执行effect
    //更新updateQueue 等等
    //准备第一次更新
    commitRoot();

	//发起调度
	//1)异步执行
    //同步任务在外面一起做
    
    //构建dom 
    Promise.resolve().then(res=>{
        if(!isScheduleUpdateing){
            isScheduleUpdateing = true;
            ReactDom.render();
            isScheduleUpdateing = false;
        }
    });
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

    //是不是第一个hook,直接挂载还是 挂链上
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

    //上棵树---对应的下一个hook
    let nextCurrentHook = null;
    if (currentHook === null) {
        const current = currentlyRenderingFiber$1.alternate;
        if (current !== null) {
            nextCurrentHook = current.memoizedState;
        } else {
            nextCurrentHook = null;
        }
    } else {
        nextCurrentHook = currentHook.next;
    }

    //获取当前树的 --下一个hook!!!
    let nextWorkInProgressHook = null;
    if (workInProgressHook === null) {
        //第一个
        nextWorkInProgressHook = currentlyRenderingFiber$1.memoizedState;
    } else {
        //当前的下一个
        nextWorkInProgressHook = workInProgressHook.next;
    }

    if (nextWorkInProgressHook !== null) {
        // 更新当前hook值  workInProgressHook、currentHook

        workInProgressHook = nextWorkInProgressHook;
        nextWorkInProgressHook = workInProgressHook.next;
    
        currentHook = nextCurrentHook;
    } else {
        // Clone from the current hook.
        //当前树 currentlyRenderingFiber$1.memoizedState 没有构建完成
        //当前currentlyRenderingFiber$1.memoizedState 为空,从旧的树中复制
    
        if (nextCurrentHook === null) {
            throw new Error('Rendered more hooks than during the previous render.');
        }
    
        //上棵树，对应当前hook 
        currentHook = nextCurrentHook;

        //新建hook
        const newHook = {
            memoizedState: currentHook.memoizedState,
            baseState: currentHook.baseState,
            baseQueue: currentHook.baseQueue,
            queue: currentHook.queue,
            next: null,
        };
    
        if (workInProgressHook === null) {
            // This is the first hook in the list.
            currentlyRenderingFiber.memoizedState = workInProgressHook = newHook;
        } else {
            // Append to the end of the list.
            workInProgressHook = workInProgressHook.next = newHook;
        }
    }

    /*
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
    */

    return workInProgressHook;
}

function updateReducer(reducer, initialArg, init) {
    let hook = updateWorkInProgressHook();
    let queue = hook.queue;

    //强制的更新方法
    //更新状态到memoizedState上
    //合并queue里的值到 memoizedState里
    let newState = hook.memoizedState;
    let firstUpdate = queue.pending && queue.pending.next;
    if(firstUpdate){
        do{
            newState = reducer(newState,firstUpdate.action);
            //递归遍历环转链表，直到第一个和最后相同
            firstUpdate = firstUpdate.next; 
        }while(firstUpdate!==queue.pending);
    }

    //清空hook queue
    hook.memoizedState = newState;
    hook.queue.pending = null;

    let dispatch = queue.dispatch;
    return [hook.memoizedState, dispatch];
}

function updateState(initialState) {
    return updateReducer(basicStateReducer);
}

function updateEffect(create,deps){
    return updateEffectImpl(Passive$1,create, deps);
}

//更新阶段 effect的执行
function updateEffectImpl(hookFlags,create,deps){
    //取得当前hook
    let hook = updateWorkInProgressHook();
    let nextDeps = deps === undefined ? null : deps;
    let destroy = undefined;
    //currentHook 对应上次的(current) hook
    if (currentHook !== null) {
        //每次 effect 记录在 hook 的 memoizedState 属性中
        let prevEffect = currentHook.memoizedState;
        destroy = prevEffect.destroy;

        if (nextDeps !== null) {
            let prevDeps = prevEffect.deps;
            //相等的话，直接pushEffect 然后return
            if (areHookInputsEqual(nextDeps, prevDeps)) {
                pushEffect(hookFlags,create, destroy, nextDeps);
                return;
            }
        }
    }
    //currentlyRenderingFiber$1.flags |= fiberFlags;
    //还是第一个式的保存
    hook.memoizedState = pushEffect(HasEffect | hookFlags, create, destroy, nextDeps);
}

//判断deps是否一致，是否要更新
function areHookInputsEqual(nextDeps, prevDeps) {
    try{
        for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
            if (objectIs(nextDeps[i], prevDeps[i])) {
              continue;
            }
            return false;
        }
        return true;
    }catch(e){
        return true;
    }
}

function mountEffect(create, deps){
    return mountEffectImpl(Passive$1, create, deps);
}

function mountEffectImpl(hookFlags,create, deps){
    //创建自己的 effectHook
    let hook = mountWorkInProgressHook();
    let nextDeps = deps === undefined ? null : deps;
    //添加flag
    //currentlyRenderingFiber$1.flags |= fiberFlags;
    //返回当前链表,挂载在hook.memoizedState上
    //第一次！！mount阶段!!
    //挂载到hook自己的 memoizedState 
    //【hook】 !!!!
    hook.memoizedState = pushEffect(HasEffect | hookFlags, create, undefined, nextDeps);
}

function pushEffect(create, destroy, deps) {
    //new 一个新的 effect 
    let effect = {
        create: create,
        destroy: destroy,
        deps: deps,
        next: null
    };

    //当前fiber的updateQueue
    let componentUpdateQueue = currentlyRenderingFiber$1.updateQueue;
    //第一次建立副作用 链表 
    if (componentUpdateQueue === null) {
        componentUpdateQueue = {
            lastEffect: null
        };
        currentlyRenderingFiber$1.updateQueue = componentUpdateQueue;
        //effect和自己建立环状链表
        componentUpdateQueue.lastEffect = effect.next = effect;
    } else {
        //添加置effect环
        //如果为空，这是一个，不太可能出现的情况？？？
        //重新如第一次一样，加入一个自己组成的环状链表
        let lastEffect = componentUpdateQueue.lastEffect;
        if (lastEffect === null) {
            componentUpdateQueue.lastEffect = effect.next = effect;
        } else {
            //环状链表操作
            //2进一出!!!!
            //保存第一个
            let firstEffect = lastEffect.next;
            //上一次的lastEffect对象指向 effect
            lastEffect.next = effect;
            //当前指向第一个effect
            effect.next = firstEffect;
            //我成为最后一个
            
        }
    }
    //返回当前 effect
    return effect;
}

function createFunctionComponentUpdateQueue() {
    return {
        lastEffect: null
    };
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