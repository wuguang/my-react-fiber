type fiber = {


    tag:Symbol;
    stateNode:any;
    props:{};
    children?:any[];

    sibling?:fiber;
    child?:fiber;
    return?:fiber;


    firstEffect?:fiber;
    lastEffect?:fiber;
    nextEffect?:fiber;

}