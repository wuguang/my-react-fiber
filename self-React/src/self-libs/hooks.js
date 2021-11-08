

let hookIndex = 0; //hooks索引


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
