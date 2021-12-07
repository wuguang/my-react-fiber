
//特指该组件对应得fiber
//构造虚假fiber对象
let currentlyRenderingFiber = {
    type:null,
    //状态 
    memoizedState:null,
    //指向已构建好的，另一个自己，
    //双缓冲
    alternate:null
};

export default currentlyRenderingFiber;