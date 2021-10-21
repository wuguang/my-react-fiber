
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

const React = {
    createElement,
    render
};


export default React;