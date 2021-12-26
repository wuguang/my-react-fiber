import {useState,useEffect} from './hooks.js';
import ReactDom from './react-dom.js';
import React from './react.js';

let n = 0;

function MyBox(props){
    let [num,setNum] = useState(0);
    let [name,setName] = useState('will');
    let [age,setAge] = useState(18);

    //console.log(`n = ${++n}`);
    //第一次初始化要执行，后续不执行了，

    /*
    useEffect(()=>{
        console.log(` ${n}--Effect [] =  ${name}#${num}---name change---`);
        setName(name + '#' + num);
    },[]);
    */

    useEffect(()=>{
        console.log(` ${n}--Effect [name] = ${name}---age change---`);
        setAge(age+1);
    },[num]);

    /*
    useEffect(()=>{
        console.log(`[num] = ${num}`);
        setName(name + '#' + num);
    },[num]);

    useEffect(()=>{
        console.log(`[name] = ${name}`);
        setAge(age+1);
    },[name]);
    */

    const btnClick = ()=>{
        setNum(num+1);
    }
    
    Promise.resolve('over').then(res=>{
        console.log(`res = ${res}`);
    });
   
    return <div id="my-container">
        <div>num = ${num}</div>
        <div>name = ${name}</div>
        <div>age = ${age}</div>
        <button onClick={btnClick}> num add 1 </button>
    </div>
}

//ReactDom.render.bind(this);
//假装 react渲染

ReactDom.render(<MyBox />,document.getElementById('root'));











