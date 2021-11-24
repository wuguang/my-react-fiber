interface Fiber {
    key:StaticRangeInit;
    props:any;
    stateNode?:HTMLElement|Function;
    child?:Fiber;
    sibling?:Fiber;
    return?:Fiber;
    alternate:Fiber;
    memoizedState?:any;
    updateQueue:any;
}

interface Hook{
    memoizedState: any;
    baseState: any;
    baseQueue: Update<any, any> | null;
    queue: any;
    next: Hook|null;
}

export type Effect = {
    tag: string;
    create: () => (() => void) | void,
    destroy: (() => void) | void,
    deps: any[],
    next: Effect,
};

/*
源码结构
type Update<S, A> = {|
  lane: Lane,
  action: A,
  hasEagerState: boolean,
  eagerState: S | null,
  next: Update<S, A>,
|};
*/

type Update<State,A> = {
    //tag?: 0 | 1 | 2 | 3,
    //payload?: any,
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
    dispatch:(A)=>S|null;

};
  
type SharedQueue<State>= {
    pending: Update<State,any>,
    interleaved: Update<State,any>,
    lanes: any;
}

type Dispatcher = {
    useState:Function;
    useEffect:Function;
    useReducer:Function;
}

export type FunctionComponentUpdateQueue = {
    lastEffect: Effect | null,
    stores: any []| null,
};

const NoFlags = /*   */ 0b0000;

// Represents whether effect should fire.
const HookHasEffect = /* */ 0b0001;

// Represents the phase in which the effect (not the clean-up) fires.
const Insertion = /*  */ 0b0010;
const Layout = /*    */ 0b0100;
const Passive = /*   */ 0b1000;

/*
HasEffect as HookHasEffect,
Layout as HookLayout,
Passive as HookPassive,
Insertion as HookInsertion,
*/

let currentlyRenderingFiber:Fiber = null;
let ReactCurrentDispatcher = {
    current:null,
}
let workInProgressHook = null;
let currentHook:Hook = null;


//初始化时用这个
const HooksDispatcherOnMount = { 
    useState: mountState,
    useReducer:mountReducer,
    useEffect: mountEffect
}

const HooksDispatcherOnUpdate = {
    useState: updateState,
    useReducer:updateReducer,
    useEffect: updateEffect
}

function is(objA,objB){
    return JSON.stringify(objA) === JSON.stringify(objB);
}

/*
作用，
将一个action(payload),构建成一个update对象，将update对象挂载到queue对象上，形成环状链表；
*/

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
    if (is(eagerState,currentState)) {                            /* 如果每一个都改变相同的state，那么组件不更新 */
       return 
    }

    //开始下一轮调度
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
        dispatch: null,
        last:null,
        //返回明确的action,即payload
        lastRenderedReducer: basicStateReducer,
        //记住上一次的 state，这里的state属于queue,queue属于明确的hook，hook属于某个明确的fiber，fiber绑定某个明确的节点 
        lastRenderedState: initialState
    };
    //dispatch 更新调度当前的queue
    const dispatch = dispatchAction.bind(null,currentlyRenderingFiber,queue); 
    queue.dispatch = dispatch;
    return [hook.memoizedState, dispatch];
}


//源码如此
//返回action 本身或称之为payload
function basicStateReducer<S>(state: S, action: BasicStateAction<S>): S {
    // $FlowFixMe: Flow doesn't like mixed types
    return typeof action === 'function' ? action(state) : action;
}

function mountEffect(create,deps){
    const hook = mountWorkInProgressHook();
    const nextDeps = deps === undefined ? null : deps;
    //currentlyRenderingFiber.effectTag |= UpdateEffect | PassiveEffect;
    
    hook.memoizedState = pushEffect( 
        HookHasEffect | hookEffectTag, 
        create, // useEffect 第一次参数，就是副作用函数
        undefined, 
        nextDeps, // useEffect 第二次参数，deps    
    );
    
}

function pushEffect(tag, create, destroy, deps) {
    // 1. 创建effect对象
    const effect: Effect = {
        tag,
        create,
        destroy,
        deps,
        next:null,
    };

    //implement by myself
    let componentUpdateQueue = currentlyRenderingFiber.updateQueue;
    if(componentUpdateQueue == null){
        //初始话updateQueue
        componentUpdateQueue = {
            lastEffect: null,
            stores: null,
        };
        componentUpdateQueue.lastEffect = effect;
        effect.next = effect;
    }else{
        let lastEffect = componentUpdateQueue.lastEffect;
        //防止为null, 和初始化保持一致
        if(lastEffect === null){
            componentUpdateQueue.lastEffect = effect;
            effect.next = effect;
        }else{
            let firstEffect = lastEffect.next;
            //更新指针， 2 进 1 出
            //lastEffect->(next)->effect;
            //updateQueue->(lastEffect)->effect;
            //effect -> (next)->firstEffect;
            lastEffect.next = effect;
            effect.next = firstEffect;
            //为什么要指向 effect  ??????
            componentUpdateQueue.lastEffect = effect;
        }
    }
    //new effect!!!! 
    return effect;

    /*
    // 2. 把effect对象添加到环形链表末尾
    let componentUpdateQueue = currentlyRenderingFiber.updateQueue;
    if (componentUpdateQueue === null) {
        // 新建 workInProgress.updateQueue 用于挂载effect对象
        // new一个
        componentUpdateQueue = {
            lastEffect: null,
            stores: null,
        };

        currentlyRenderingFiber.updateQueue = componentUpdateQueue;
        // updateQueue.lastEffect是一个环形链表
        //第一次 自己指向自己
        componentUpdateQueue.lastEffect = effect.next = effect;
    } else {
        //啥啥啥.....这里.....
        const lastEffect = componentUpdateQueue.lastEffect;
        if (lastEffect === null) {
            componentUpdateQueue.lastEffect = effect.next = effect;
        } else {
            const firstEffect = lastEffect.next;
            lastEffect.next = effect;
            effect.next = firstEffect;
            componentUpdateQueue.lastEffect = effect;
        }
    }
    // 3. 返回effect
    return effect;
    */
}

function mountReducer(){
    // There

}

//于BasicStateAction类型一致
type initStateType <S> = () => S | S;

//源码如此
//不做类型限制了

function updateState(){
    return updateReducer(basicStateReducer);
}

//重新取值而已，合并，清空队列
//忽略了优先级 等
function updateReducer(reducer){
    const hook = updateWorkInProgressHook();
    const {queue} = hook;

    //赋值reducer？？？why,不是有了么？
    queue.lastRenderedReducer = reducer;

    const current: Hook = currentHook;
    const pendingQueue = queue.pending;

    if(pendingQueue!==null){
        let first = pendingQueue.next;//第一个更新对象
        let newState = current.memoizedState;//拿到老状态

        let update = first;
        //将 pendingQueue 里的任务消耗调，得到最新的状态
        do{
            const action = update.action;//action：就是传的参数，例如setState('参数')
            newState = reducer(newState,action);//计算新状态，因为如果传的是函数，要依赖老状态
            update = update.next;
        }while(update !== null && update !== first);
        //清空整理 指针
        queue.pending = null;//更新过了可以清空更新环形链表
        hook.memoizedState =  newState;//让新的hook对象的memoizedState等于计算的新状态    
        queue.lastRenderedState = newState;//把新状态也赋值给lastRenderedState一份
    }
    const dispatch = dispatchAction.bind(null, currentlyRenderingFiber, queue);
    return [hook.memoizedState, dispatch];

    //第一步把待更新的pending队列取出来
}

function updateWorkInProgressHook(): Hook {
    // This function is used both for updates and for re-renders triggered by a
    // render phase update. It assumes there is either a current hook we can
    // clone, or a work-in-progress hook from a previous render pass that we can
    // use as a base. When we reach the end of the base list, we must switch to
    // the dispatcher used for mounts.
    let nextCurrentHook: null | Hook;
    if (currentHook === null) {
      const current = currentlyRenderingFiber.alternate;
      if (current !== null) {
        nextCurrentHook = current.memoizedState;
      } else {
        nextCurrentHook = null;
      }
    } else {
      nextCurrentHook = currentHook.next;
    }
  
    let nextWorkInProgressHook: null | Hook;
    if (workInProgressHook === null) {
      nextWorkInProgressHook = currentlyRenderingFiber.memoizedState;
    } else {
      nextWorkInProgressHook = workInProgressHook.next;
    }
  
    if (nextWorkInProgressHook !== null) {
      // There's already a work-in-progress. Reuse it.
      workInProgressHook = nextWorkInProgressHook;
      nextWorkInProgressHook = workInProgressHook.next;
  
      currentHook = nextCurrentHook;
    } else {
      // Clone from the current hook.
  
      if (nextCurrentHook === null) {
        throw new Error('Rendered more hooks than during the previous render.');
      }
  
      currentHook = nextCurrentHook;
  
      const newHook: Hook = {
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
    return workInProgressHook;
}
  

function updateEffect(){

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
    return children;
    //这里不设置
    //ReactCurrentDispatcher.current = ContextOnlyDispatcher;  /* 将hooks变成第一种，防止hooks在函数组件外部调用，调用直接报错。 */
}

function  scheduleUpdateOnFiber(fiber){
    //开始调度
    //......
}

function resolveDispatcher() {
    const dispatcher = ReactCurrentDispatcher.current;
    return dispatcher;
}

function createFunctionComponentUpdateQueue(): FunctionComponentUpdateQueue {
    return {
        lastEffect: null,
        stores: null,
    };
}

export function useState<S>(initialState: (() => S) | S): [S, Dispatch<BasicStateAction<S>>] {
    const dispatcher = resolveDispatcher();
    return dispatcher.useState(initialState);
}

export function useEffect(
    create: () => (() => void) | void,
    deps: any[],
  ): void {
    const dispatcher = resolveDispatcher();
    return dispatcher.useEffect(create, deps);
}

export function useReducer(reducer) {
    const dispatcher = resolveDispatcher();
    return dispatcher.useReducer(reducer);
}


export default {
    renderWithHooks
}

//export const obj =  ReactCurrentDispatcher.current;


