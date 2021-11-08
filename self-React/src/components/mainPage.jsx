

<<<<<<< HEAD:self-React/src/components/mainPage.jsx
import React from '../libs/react';
=======
import React from '../self-libs/react';
>>>>>>> a30ec0e01505d25ad8219eb467ff178db33a155d:self/src/components/mainPage.jsx
import './main.less';


class Ball extends React.Component{
    constructor(props){
        //console.log('i am ball~~');
        super(props)
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
        let start = performance.now();
        let target = start + 1;
        while(start<target){
            start = performance.now();
        }
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

    inputChange = (e)=>{
        let value = e.target.value;
        this.setState({
            inputValue:value
        });
    }

    render(){
        return <div>
            <input className="my-input" value={this.state.inputValue}  onInput ={ this.inputChange } />
            <div className="main-content">
                {
                    Array(100).fill(null).map((item,index)=>{
                        return <Ball key={index} />
                    })
                }
            </div>
        </div>
    }
}

export default MainPage;