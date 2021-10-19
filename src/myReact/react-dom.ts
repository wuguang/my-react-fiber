import {TAG_ROOT} from './constants';
import {scheduleRoot} from './scheduler';

const render = (element,rootContainer)=>{
    let rootFiber = {
        tag:TAG_ROOT,
        stateNode:rootContainer,
        props:{
            children:[element]
        }
    }

    scheduleRoot(rootFiber);
}

export default{
    render
}