//process.env.NODE_ENV = 'development';

const ReactDom = window.ReactDom;
const React = window.React;
const { useEffect , useState , useRef , useMemo  } = React;

//import ReactDom  from './react-dom/index.js';
//import React,{ useEffect , useState , useRef , useMemo  } from './react/index.js'

const root = document.getElementById("react-fiber-root");

function Main(){
    const [show,setShow] = useState(true);
    const [ number , setNumber ] = useState(0)
    const DivDemo = useMemo(() => React.createElement("div", null, " hello , i am useMemo "),[])
    const curRef  = useRef(null)

    useEffect(()=>{
        console.log(curRef.current)
    },[]);

    const triggleShow = ()=>{
        console.log(`show = ${show}`);
        setShow(!show);
    }

    const One = ()=>{
        return <React.Fragment>
            <p  key="1">11</p>
            <p  key="2">11</p>
            <p  key="3">11</p>
        </React.Fragment>
    }

    const Two = ()=>{
        return <React.Fragment>
            <span  key="1">11</span>
            <span  key="2">11</span>
            <span  key="3">11</span>
        </React.Fragment>
    }


    let one = [{key:'1',name:1},{key:'2',name:2},{key:'3',name:3}];
    //let oneComponent = <p key="3">--My one---</p>;
    let oneComponent = one.map(item=>{
        return <p key={item.key}>{item.name}</p>
    });
    
    //[{key:'2',name:2},{key:'3',name:3},{key:'1',name:1},{key:'4',name:4}]


    let two = [{key:'3',name:3},{key:'4',name:4},{key:'2',name:2},{key:'1',name:1}];
    let twoComponent = two.map(item=>{
        return <p key={item.key}>{item.name}</p>
    });


    /*
    1,2,3
    ===>
    3  3,
    */
    
    return <div id="out">
        <div id="test_container">
            {show?oneComponent:twoComponent}
        </div>
        <button onClick={triggleShow}>+ click me +</button>
    </div>
}

function TestHooks(){

    const [num,setNum] = useState(0);

    const [name,setName] = useState('will');

    const [height,setHeight] = useState(180);

    useEffect(()=>{
        setName(`will_${num}`);
        //{value:1}->{value:2}->{num+1}->{num+2}
    },[num]);

    useEffect(()=>{
        console.log(`num = ${num}---name = ${name}`);
    },[name]);

    useEffect(()=>{
        console.log('height = ${height}');
    },[]);

    const addOne = ()=>{
        setNum(num+1);
        setNum(num+2);
        setNum(num=> num+1);
        setNum(num=> num+2);
    }

    return <div>

        <h2>num = {num}</h2>
        <h3>name = {name}</h3>
        <h3>height = {height}</h3>
        <button onClick={addOne}> click me plus one ~ </button>   

    </div>

}


ReactDom.render(<Main/>,root);
