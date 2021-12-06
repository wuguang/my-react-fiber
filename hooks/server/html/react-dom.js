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
                //注册事件直接注册到dom

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

let ReactDom = {
    render:(fun,root)=>{
        let jsx = fun();
        console.log(JSON.stringify(jsx));
        let dom = getDomFromJsx(jsx)


        //root.innerHTML = JSON.stringify(jsx);
        root.appendChild(dom);
    }
}

export default ReactDom;