


const symbolFor = Symbol.for;


//作为Fiber tag 用的
//React应用需要一个根Fiber
export const TAG_ROOT = symbolFor('TAG_ROOT');

//文本节点
export const TAG_TEXT = symbolFor('TAG_TEXT');

//原生的节点 span div p 函数组件 类组件
export const TAG_HOST = symbolFor('TAG_HOST');

//类组件
export const TAG_CLASS = symbolFor('TAG_CLASS');

//函数组件
export const TAG_FUNCTION_COMPONENT = symbolFor('TAG_FUNCTION_COMPONENT');






//文本节点与文本元素的差异？？为什么定义2个
//表示一个文本元素
export const ELEMENT_TEXT = symbolFor('ELEMENT_TEXT');

//新增节点
export const PLACEMENT = symbolFor('PLACEMENT');
//删除节点
export const DELETION = symbolFor('DELETION');
//更新节点
export const UPDATE = symbolFor('UPDATE');


