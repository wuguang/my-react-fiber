//process.env.NODE_ENV = 'development';

const ReactDom = window.ReactDom;
const React = window.React;
const { useEffect , useState , useRef , useMemo ,useLayoutEffect } = React;

//import ReactDom  from './react-dom/index.js';
//import React,{ useEffect , useState , useRef , useMemo  } from './react/index.js'
const root = document.getElementById("react-fiber-root");


function DiffSingle(){
    const [trigger,setTrigger] = useState(true);

    const oneJsx = (()=>{
        let arr = [{key:1,content:1},{key:2,content:2},{key:3,content:3},{key:4,content:4}];
        return arr.map(item=>{
            return <p key={item.key}>{item.content}</p>
        });
    })();
    const twoJsx = <p>I am signle one ~~ </p>

    useEffect(()=>{
        console.log(`~~~trigger = ${trigger}`);
    },[]);

    const clickFun = ()=>{
        setTrigger(!trigger);
    }

    return <div>
        <div id="diff-container">
        {trigger?oneJsx:twoJsx}
        </div>  
        <div>     
            <button onClick={clickFun}> click me trigger </button>
        </div>
    </div>
}


function DiffArr(){
    const [trigger,setTrigger] = useState(true);

    const oneJsx = (()=>{
        let arr = [{key:1,content:1},{key:2,content:2},{key:3,content:3},{key:4,content:4}];
        return arr.map(item=>{
            return <p key={item.key}>{item.content}</p>
        });
    })();

    const twoJsx = (()=>{
        let arr = [{key:4,content:4},{key:2,content:2},{key:1,content:1},{key:3,content:3}];
        return arr.map(item=>{
            return <p key={item.key}>{item.content}</p>
        });
    })();

    const clickFun = ()=>{
        setTrigger(!trigger);
    }

    return <div>
        <div id="diff-container">
            {trigger?oneJsx:twoJsx}
            <div>       
                <button onClick={clickFun}> click me trigger </button>
            </div>
        </div>
    </div>
}


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

    useLayoutEffect(()=>{
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

/*
render 1

num = 0;


n = 1;

===>Async ==> Effect
[] = 0;

num = 1;

render 2

num = 1;
n = 2;









*/




//假装 react渲染
ReactDom.render(<MyBox />,root);

