//当前节点 Fiber 构建中的
let currentlyRenderingFiber = null;
let lastFiber = null;
let ReactCurrentDispatcher = null;
let workInProgressHook = null;

function renderWithHooks(current,workInProgress,Component,props){
    lastFiber = current;
    currentlyRenderingFiber = workInProgress;
    workInProgress.memoizedState = null;  /* 每一次执行函数组件之前，先清空状态 （用于存放hooks列表）*/
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
        //执行 function
        create();
    }else{
        //updateEffect(create,deps);
        //const hook = updateWorkInProgressHook();
        if (!areHookInputsEqual(nextDeps, prevDeps)) { 
            create();
        } 
    }
}

function updateEffect(create,deps){
    workInProgressHook = currentlyRenderingFiber.memoizedState;

    return workInProgressHook;
}


function useState(){

}




function updateWorkInProgressHook(){
    //获取当前hook
    if(workInProgressHook){
        workInProgressHook = lastFiber.memoizedState;
    }else{
        workInProgressHook = workInProgressHook.next;
    }
    return workInProgressHook;
}

//第一次挂载时
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

function mountEffect(create,deps){
    const hook = mountWorkInProgressHook();
    const nextDeps = deps === undefined ? null : deps;
    create();
}


//暴力对比
function areHookInputsEqual(nextDeps, prevDeps){
    return JSON.stringify(nextDeps) === JSON.stringify(prevDeps);
}
