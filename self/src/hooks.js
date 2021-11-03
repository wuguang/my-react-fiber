//当前节点 Fiber 构建中的
let currentlyRenderingFiber = null;
let lastFiber = null;
let ReactCurrentDispatcher = null;
let workInProgressHook = null;

function renderWithHooks(current,workInProgress,Component,props){
    lastFiber = current;
    currentlyRenderingFiber = workInProgress;
    workInProgress.memoizedState = null; /* 每一次执行函数组件之前，先清空状态 （用于存放hooks列表）*/
    workInProgress.updateQueue = null;    /* 清空状态（用于存放effect list） */
    
    //ReactCurrentDispatcher.current =  current === null || current.memoizedState === null ? HooksDispatcherOnMount : HooksDispatcherOnUpdate /* 判断是初始化组件还是更新组件 */
    let children = Component(props, secondArg=null); /* 执行我们真正函数组件，所有的hooks将依次执行。 */
    //一次挂在
    if(current === null || current.memoizedState === null ){

    }else{

    }
}

function useEffect(create,deps){
    //第一次
    if(lastFiber === null || lastFiber.memoizedState === null ){
        //mountEffect
        const hook = mountWorkInProgressHook();
        const nextDeps = deps === undefined ? null : deps;
        create();

        //currentlyRenderingFiber.effectTag |= UpdateEffect | PassiveEffect;
        
        hook.memoizedState = {
            create,
            deps:nextPeps,
            next:hook.next
        }
        
        /*
        pushEffect( 
            HookHasEffect | hookEffectTag, 
            create, // useEffect 第一次参数，就是副作用函数
            undefined, 
            nextDeps, // useEffect 第二次参数，deps    
        )
        */
        

    }else{
        updateEffect(create,deps);
    }
}

function useState(){

}

function updateEffect(){

}

function mountEffect(create,deps){
    const hook = mountWorkInProgressHook();
    const nextDeps = deps === undefined ? null : deps;
    currentlyRenderingFiber.effectTag |= UpdateEffect | PassiveEffect;
    hook.memoizedState = pushEffect( 
      HookHasEffect | hookEffectTag, 
      create, // useEffect 第一次参数，就是副作用函数
      undefined, 
      nextDeps, // useEffect 第二次参数，deps    
    )
}

function mountWorkInProgressHook() {
    const hook = {  memoizedState: null, baseState: null, baseQueue: null,queue: null, next: null,};
    if (workInProgressHook === null) {  // 只有一个 hooks
      currentlyRenderingFiber.memoizedState  = hook;
      //记住上次hook
      workInProgressHook = hook;

    } else {  // 有多个 hooks
        //上次hook 执向当前hook
        workInProgressHook.next = hook;
        //更新上次hook结果
        workInProgressHook = hook;
    }
    return workInProgressHook;
}

function updateEffect(create,deps){
    const hook = updateWorkInProgressHook();
    if (areHookInputsEqual(nextDeps, prevDeps)) { /* 如果deps项没有发生变化，那么更新effect list就可以了，无须设置 HookHasEffect */
        pushEffect(hookEffectTag, create, destroy, nextDeps);
        return;
    } 
    /* 如果deps依赖项发生改变，赋予 effectTag ，在commit节点，就会再次执行我们的effect  */
    currentlyRenderingFiber.effectTag |= fiberEffectTag
    hook.memoizedState = pushEffect(HookHasEffect | hookEffectTag,create,destroy,nextDeps)
}
