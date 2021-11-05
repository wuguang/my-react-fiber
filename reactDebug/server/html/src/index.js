

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

ReactDom.render(setTimer03Jsx,root);




