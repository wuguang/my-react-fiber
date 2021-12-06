function createElement(type,config,...children) {
    let validChildren = [];
    //校验子节点的合法性
    children.forEach(child=>{
        if(child !== null && child !== undefined){
            validChildren.push(child);
        }
    });

    if(validChildren.length === 1){
        //构造单节点元素
        //children 不一定是数组，可能是数字等等
        validChildren = validChildren[0];
    }

    return {
        type,
        props:{
            ...config,//属性扩展 id，key
            children:validChildren
        }
    }
}


export function setProps(dom,oldProps,newProps) {
    for(let key in oldProps){
        if(key !== 'children') {
            if(newProps.hasOwnProperty('key')) {//新老都有更新
                setProp(dom, key,newProps[key]);
            }else{//老的有新的没有删除
                dom.removeAttribute(key);
            }
        }
    }
    for(let key in newProps){
        if(key !== 'children') {
            if(!oldProps.hasOwnProperty('key')) {//老的没有新的有，添加
                setProp(dom, key, newProps[key]);
            }
        }
    }
}

function setProp(dom,key,value) {
    if(/^on/.test(key)) {
        dom[key.toLowerCase()] = value;//没有用合成事件
    }else if(key === 'style') {
        if(value){
            let styleStr = '';
            for (let styleName in value){
                if (value.hasOwnProperty(styleName)) {
                    dom.style[styleName] = value[styleName];
                    let styleValue = value[styleName];
                    if(styleName === 'borderRadius'){
                        styleName = 'border-radius';
                    }
                    styleStr += `${styleName}:${styleValue}${typeof styleValue === 'number'?'px':''};`
                }
            }
            dom.setAttribute('style',styleStr);
        }
    }else {
        if(key.toLowerCase() === 'classname'){
            key = 'class';
        }
        dom.setAttribute(key,value);
    }
    return dom;
}


const React = {
    createElement
}

export default React;