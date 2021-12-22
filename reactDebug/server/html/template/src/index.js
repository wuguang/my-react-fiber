

import ReactDom  from 'react-dom';
import React , { useEffect , useState , useRef , useMemo  } from 'react'

const root = document.getElementById("react-fiber-root");

function SetTimer03(){

    const [ number , setNumber ] = useState(0)
    const DivDemo = useMemo(() => <div> hello , i am useMemo </div>,[])
    const curRef  = useRef(null)

    useEffect(()=>{
       console.log(curRef.current)
    },[]);

    const contentJsx = React.createElement("div", {
        ref: curRef
      }, "hello,world ", number, DivDemo, React.createElement("button", {
        onClick: () => setNumber(number + 1)
      }, "number++"));

    return contentJsx;
}



const setTimer03Jsx = React.createElement(React.Fragment, null, React.createElement(SetTimer03, null));

function DiffSingle(){
    const [trigger,setTrigger] = useState(true);
    const oneJsx = (()=>{
        let arr = [{key:1,content:1},{key:2,content:2},{key:3,content:3},{key:4,content:4}];
        return arr.map(item=>{
            <span key={item.key}>{item.content}</span>
        });
    })();
    const twoJsx = <p>I am signle one ~~ </p>

    const clickFun = ()=>{
        setTigger(!trigger);
    }

    useEffect(()=>{
        console.log(`trigger ~~~~ = ${trigger}`);
    },[]);

    return <div>
        <div id="diff-container">
            {trigger?oneJsx:twoJsx}
            <div>       
                <button onClick={clickFun}> click me trigger </button>
            </div>
        </div>
    </div>
}


function DiffArr(){
    const [trigger,setTrigger] = useState(true);

    const oneJsx = (()=>{
        let arr = [{key:1,content:1},{key:2,content:2},{key:3,content:3},{key:4,content:4}];
        return arr.map(item=>{
            <span key={item.key}>{item.content}</span>
        });
    })();

    const twoJsx = (()=>{
        let arr = [{key:4,content:4},{key:2,content:2},{key:1,content:1},{key:3,content:3}];
        return arr.map(item=>{
            <span key={item.key}>{item.content}</span>
        });
    })();

    const clickFun = ()=>{
        setTigger(!trigger);
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

ReactDom.render(<DiffSingle />,root);




