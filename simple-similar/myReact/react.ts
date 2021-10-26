
import {UpdateQueue,Update} from './updateQueue';
import { scheduleRoot, useReducer, useState } from './scheduler';

function createTextVDom(text) {
    return {
        type: 'TEXT',
        props: {
            nodeValue: text,
            children: []
        }
    }
}

//type 是组件或标签的名字

//可能是ClassComponent/function Component/ html原生标签
//811 行 function createElement(type, config, children)

//children的数组如何生成的
const createElement = (type,config,...children)=>{
    return {
        type,
        props: {
            ...config,
            children: children.map(child => {
                return typeof child === 'object' ? child: createTextVDom(child)
            })
        }
    }
}

const render = (root,component)=>{

}

class Component {
    props:null;
    internalFiber:Fiber;
    isReactComponent = true;
    constructor(props){
        this.props = props;
    }

    setState(payload){
        let update = new Update(payload);
        this.internalFiber.updateQueue.enqueueUpdate(update);
        scheduleRoot();
    }  
}

/*
ELEMENT_TEXT
*/

const React = {
    createElement,
    render,
    Component
};


export default React;