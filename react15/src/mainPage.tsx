

import React from 'react';
import './main.less';


class Ball extends React.Component{
    constructor(props){
        console.log('i am ball~~');
        super(props)
    }
    
    componentWillMount(){
        
    }


    randomHexColor() { //随机生成十六进制颜色
         var hex = Math.floor(Math.random() * 16777216).toString(16); //生成ffffff以内16进制数
         while (hex.length < 6) { //while循环判断hex位数，少于6位前面加0凑够6位
          hex = '0' + hex;
         }
         return '#' + hex; //返回‘#'开头16进制颜色
    }

    render(){
        let width = Math.random()*100;
        let radius = width;
        let color = this.randomHexColor();
        let left = Math.random()*(600 - width)
        let top = Math.random()*(400 - width)
        //let opacity = Math.random();
        return <div className="ball" style={{width,height:width,borderRadius:radius,background:color,left,top}}>
        </div>        
    }
}

class MainPage extends React.Component{
    
    state = null;
    constructor(props){
        super(props);
        this.state = {
            inputValue:''
        }
    }
    componentDidMout(){

    }

    inputChange = (e)=>{
        let value = e.target.value;
        this.setState({
            inputValue:value
        });
    }

    render(){
        return <div>
            <input value={this.state.inputValue}  onChange ={ this.inputChange } />
            <div className="main-content">
                {
                    Array(10000).fill(null).map((item,index)=>{
                        return <Ball key={index} />
                    })
                }
            </div>
        </div>
    }
}




export default MainPage;