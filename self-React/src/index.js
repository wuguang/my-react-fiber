/**
 * index.js:webpack入口起点文件
 */


/*
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
*/
<<<<<<< HEAD:self-React/src/index.js
import React from './libs/react';
import ReactDOM from './libs/react-dom';
=======
import React from './self-libs/react';
import ReactDOM from './self-libs/react-dom';
>>>>>>> a30ec0e01505d25ad8219eb467ff178db33a155d:self/src/index.js

import MainPage from './components/mainPage.jsx';

const {useState,useEffect} = React;

class Test01 extends React.Component {

    state = {
        number:0
    }

    addNum = ()=>{
        this.setState({number:this.state.number+1});
    }

    render(){
        return <div> 
            <p> hello </p>
            <p id="number">{this.state.number}</p>
            <p> <button onClick={ this.addNum} > number ++ </button></p>
        </div>
    } 
}

const Test02 = ()=>{
    const [number,setNumber] = useState(0);

    const addNum = ()=>{
        setNumber(number + 1);
    }

    useEffect(()=>{
        //setNumber(3);
    },[]);

    return <div> 
        <p> hello </p>
        <p id="number">{number}</p>
        <p> <button onClick={ ()=>{addNum()}} > number ++ </button></p>
    </div>
}

ReactDOM.render(<Test02 />,document.getElementById("root"));
