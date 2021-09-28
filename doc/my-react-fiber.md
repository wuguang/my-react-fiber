

## Model-View-ViewMode 框架的

## jsx 本质
```
<div id="top-1">
  I div's am content
  <h2>hello world</h2>
  <ul>
    <li>我是1</li>
    <li>我是2</li>
    <li>我是3</li>
    <li>我是4</li>
  </ul>
</div>





let React = {createElement};
//返回reactElement，可认为是虚拟节点

"use strict";
/*#__PURE__*/
let myReactElment = React.createElement("div", {
  id: "top-1"
}, "I div's am content", /*#__PURE__*/React.createElement("h2", null, "hello world"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, "\u6211\u662F1"), /*#__PURE__*/React.createElement("li", null, "\u6211\u662F2"), /*#__PURE__*/React.createElement("li", null, "\u6211\u662F3"), /*#__PURE__*/React.createElement("li", null, "\u6211\u662F4")));

console.log(JSON.stringify(myReactElment));



function createTextVDom(text) {
  return {
    type: 'TEXT',
    props: {
      nodeValue: text,
      children: []
    }
  }
}



function createElement(type, props, ...children) {
  // 核心逻辑不复杂，将参数都塞到一个对象上返回就行
  // children也要放到props里面去，这样我们在组件里面就能通过this.props.children拿到子元素
  return {
    type,
    props: {
      ...props,
      children: children.map(child => {
        return typeof child === 'object' ? child: createTextVDom(child)
      })
    }
  }
}

//react 内部的数据结构

{"type":"div","props":{"id":"top-1","children":[{"type":"TEXT","props":{"nodeValue":"I div's am content","children":[]}},{"type":"h2","props":{"children":[{"type":"TEXT","props":{"nodeValue":"hello world","children":[]}}]}},{"type":"ul","props":{"children":[{"type":"li","props":{"children":[{"type":"TEXT","props":{"nodeValue":"我是1","children":[]}}]}},{"type":"li","props":{"children":[{"type":"TEXT","props":{"nodeValue":"我是2","children":[]}}]}},{"type":"li","props":{"children":[{"type":"TEXT","props":{"nodeValue":"我是3","children":[]}}]}},{"type":"li","props":{"children":[{"type":"TEXT","props":{"nodeValue":"我是4","children":[]}}]}}]}}]}}



```


### react的状态更新，及存在的问题

更新state==>执行render()===>得到虚拟dom(reactElement)===》对比新旧dom节点===>对真实dom 做相应的的【增删改】

当项目存在大量节点时，对比新旧dom节点的必然消耗大量时间，当时间超过一定阈值时，带来浏览器掉帧，出现卡顿。


demo,示例演示


### 简化任务，提出解决方案,时间片requestIdleCallback

FPS（frame per second）是浏览器每秒刷新的次数

```

```


















