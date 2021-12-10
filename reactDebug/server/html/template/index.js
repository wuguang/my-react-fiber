//process.env.NODE_ENV = 'development';

const ReactDom = window.ReactDom;
const React = window.React;
const { useEffect , useState , useRef , useMemo  } = React;

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



ReactDom.render(<DiffSingle/>, root);
