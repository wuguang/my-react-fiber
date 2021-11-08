/**
 * index.js:webpack入口起点文件
 */
import React from './react';
import ReactDOM from './react-dom';

class ClassCounter extends React.Component {
    constructor(props) {
        super(props);
        this.state = { number:0 };
    }

    onClick = () =>{
        this.setState(state => ({
            number: state.number + 1
        }))
    }

    render() {
        let { number } = this.state;
        return (
            <div id = "counter" name={this.props.name}>
                <span>{number}</span>
                <button onClick={this.onClick}>加1</button>
            </div>
        )
    }
}

const ADD = 'ADD';

function reducer(state,action) {
    switch (action.type) {
        case ADD:
            return { count:state.count +1 };
        default:
            return state;
    }
}

function FunctionCounter() {
    const [numberState,setNumberState] = React.useState({ number:0 });
    const [countState,dispatch] = React.useReducer(reducer, { count:0 });
    return (
        <div>
            <div id = "counter1">
                <span>{numberState.number}</span>
                <button onClick={() => setNumberState({ number: numberState.number + 1 })}>加1</button>
            </div>
            <div id = "counter2">
                <span>{countState.count}</span>
                <button onClick={() => dispatch({ type: ADD })}>加1</button>
            </div>
        </div>
    )
}


const  Ball  = ()=>{
    const randomHexColor = ()=>{ //随机生成十六进制颜色
         var hex = Math.floor(Math.random() * 16777216).toString(16); //生成ffffff以内16进制数
         while (hex.length < 6) { //while循环判断hex位数，少于6位前面加0凑够6位
          hex = '0' + hex;
         }
         return '#' + hex; //返回‘#'开头16进制颜色
    }
    let width = Math.random()*100;
    let radius = width;
    let color = randomHexColor();
    let left = Math.random()*(600 - width)
    let top = Math.random()*(400 - width);
    let now = Date.now();
    let target = now + 2;
    while(now<target){
        now = Date.now();
    }
    return <div className="ball" style={{width,height:width,borderRadius:radius,background:color,left,top}}> </div>    
}


const  MainPage  = ()=>{
    const [inputValue,setIputValue] = React.useState('');
    const inputChange = (e)=>{
        let value = e.target.value;
        setIputValue(Math.random()+'');
        console.log(`value=${value}`);
    }

    return <div>
        <input  onInput={inputChange } />
        <div className="main-content">
            {
                Array(100).fill(null).map((item,index)=>{
                    return <Ball key={index} />
                })
            }
        </div>
    </div>  
}

ReactDOM.render(<MainPage />,document.getElementById("root"));
