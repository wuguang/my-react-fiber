import {updateFiber,scheduleUpdateOnFiber} from './hooks.js';
import React from './react.js';
let eventProxy = [];

function getDomFromJsx(jsx){
    //将jsx转化成 dom节点，直接渲染到界面上
    //递归渲染
    if(typeof jsx === 'object'){
        let {type,props} = jsx;
        let children = props.children;
        let dom = document.createElement(type);
        let reg = /^on/;
        for(let k in props){
            if(k === 'class'){
                dom.setAttribute('className',props[k]);
            }else if(reg.test(k)){
                let eventFun = props[k];
                //注册事件直接注册到dom
                dom.addEventListener(k.slice(2).toLocaleLowerCase(),eventFun,false);
            }else if(k !== 'children'){
                dom.setAttribute(k,props[k]);
            }
        }

        if(Array.isArray(children)){
            children.forEach(child=>{
                let childDom = getDomFromJsx(child);
                dom.appendChild(childDom);
            });
        }else if(typeof children === 'string'){
            let childDom = getDomFromJsx(children);
            dom.appendChild(childDom);
        }
        
        return dom;
    }else{
        return document.createTextNode(jsx);
    }
}

let topRoot = null;
let topType = null;

let isFirst = false;

let ReactDom = {
    render:(component,root)=>{
        topRoot = root;
        topType = component.type;
        //
        scheduleUpdateOnFiber();
    }
}

export function renderToPage(){
    let jsx = topType();
    let dom = getDomFromJsx(jsx);
    if(!isFirst){
        isFirst = true;
        scheduleUpdateOnFiber();
        return;
    }
    //先清空在装载内容
    root.innerHTML = '';
    root.appendChild(dom);
    updateFiber(topType);
}

export default ReactDom;