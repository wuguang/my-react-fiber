import {useState,useEffect} from './hooks.js';
import ReactDom from './react-dom.js';
import React from './react.js';

function myBox(props){
    let [num,setNum] = useState(0);
    let [name,setName] = useState('will');
    let [age,setAge] = useState(18);

    useEffect(()=>{
        setNum(num+1);
    },[]);

    useEffect(()=>{
        setName(name + '#' + num);
    },[num]);

    useEffect(()=>{
        setAge(age+1);
    },[name]);

    const onClick = ()=>{
        setNum(num+1);
    }
    
    return <div>
        <div>num = ${num}</div>
        <div>name = ${name}</div>
        <div>age = ${age}</div>
        <button> click me !</button>
    </div>
    
}

//假装 react渲染
ReactDom.render(myBox,document.getElementById('root'));











