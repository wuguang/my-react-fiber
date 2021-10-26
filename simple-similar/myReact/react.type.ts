
type Fiber = {

    $$typeof?:Symbol;
    tag:Symbol;
    type:any;
    //string|Function|((props:any)=>any);
    //dom节点string名字， classComponent类  ,functionComponent
    stateNode:any;
    props:any;
    
    children?:any[];

    sibling?:Fiber;
    child?:Fiber;
    return?:Fiber;


    firstEffect?:Fiber;
    lastEffect?:Fiber;
    nextEffect?:Fiber;

    //组件任务队列
    updateQueue?:any;
    hooks?:any[];

    effectTag?:symbol;
    //新旧互指
    alternate?:Fiber;

}