#### didReceiveUpdate:Boolean




#### vocabulary

assume 假设、假定

bail out react解释对比后没有改动，自动退出


#### hook 链表的生成

第一次 初始化 hook链表
所有use开头的函数
fiber.memoriedState = {
    memoizedState:1,
    queue:UpdateQueue,
    next:newHook|null
}



#### effect以 Fiber.updateQueue的方式 环状链表的存储
在commit时候执行，打上标记


#### useState，dispather 的更新
hook.queue是一个环状链表,要特殊处理下, 底层是基本信息,真正的update存放在peding上
```javascript
{
    pending: null,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: initialState
};
```

update 是更新的对象












### useState-->mountState--function
``` javascript

useState(){
    mountState();
}


//
function mountState(initialState) {
    var hook = mountWorkInProgressHook();

    if (typeof initialState === 'function') {
        // $FlowFixMe: Flow doesn't like mixed types
        initialState = initialState();
    }
    //初始化时，值的来源
    hook.memoizedState = hook.baseState = initialState;

    //初始化 queue
    var queue = hook.queue = {
        pending: null,
        dispatch: null,
        lastRenderedReducer: basicStateReducer,
        lastRenderedState: initialState
    };

    var dispatch = queue.dispatch = dispatchAction.bind(null, currentlyRenderingFiber$1, queue);
    return [hook.memoizedState, dispatch];

}


// 构建hook ,挂载Fiber,hook链表上
function mountWorkInProgressHook(){
    var hook = {
        memoizedState: null,
        baseState: null,
        baseQueue: null,
        queue: null,
        next: null
    };

    if (workInProgressHook === null) {
        // This is the first hook in the list
        currentlyRenderingFiber$1.memoizedState = workInProgressHook = hook;
    } else {
        // Append to the end of the list
        workInProgressHook = workInProgressHook.next = hook;
    }

    return workInProgressHook;

}


//添加effect ,构建环状链表

function pushEffect(tag, create, destroy, deps) {
    var effect = {
      tag: tag,
      create: create,
      destroy: destroy,
      deps: deps,
      // Circular
      next: null
    };
    var componentUpdateQueue = currentlyRenderingFiber$1.updateQueue;

    if (componentUpdateQueue === null) {
      componentUpdateQueue = createFunctionComponentUpdateQueue();
      currentlyRenderingFiber$1.updateQueue = componentUpdateQueue;

      //effect List是个环状链表 !!!!!,收尾相连

      componentUpdateQueue.lastEffect = effect.next = effect;
    } else {
        //2 进 1 出
        var lastEffect = componentUpdateQueue.lastEffect;
        if (lastEffect === null) {
            componentUpdateQueue.lastEffect = effect.next = effect;
        } else {
            var firstEffect = lastEffect.next;
            lastEffect.next = effect;
            effect.next = firstEffect;
            componentUpdateQueue.lastEffect = effect;
        }
    }

    return effect;
}

```
