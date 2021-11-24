
import React from './self-libs/react';
import ReactDOM from './self-libs/react-dom';

//import MainPage from './components/mainPage.jsx';

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
class Test02 extends React.Component{
    state = {
        number:0
    }

    addNum = ()=>{
        this.setState({
            number:this.state.number+1
        });
    }

    render(){
        return <div> 
            <p> hello </p>
            <p id="number">{this.state.number}</p>
            <p> <button onClick={ this.addNum } > number ++ </button></p>
        </div>
    }

}




ReactDOM.render(<Test02 />,document.getElementById("react-fiber-root"));

document.getElementById("react-fiber-root").innerHTML = '<h2>hello world~~</h2>'


