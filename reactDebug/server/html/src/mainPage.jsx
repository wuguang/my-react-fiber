

import React, { useState} from 'react';
import { unstable_scheduleCallback } from "scheduler";

import './main.less';

//sandbox demo
//https://codesandbox.io/s/koyz664q35?file=/package.json:172-178

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

class  MainPage extends React.Component{
    state = {
        inputValue:'',

    }
    constructor(props){
        super(props);
    }

    inputChange = (e)=>{
        unstable_scheduleCallback(5000,()=>{
            this.setState(Math.random()+'')
        });
        //setIputValue(Math.random()+'');
    }

    //  <div>{inputValue}</div>
    
    render(){
        return <div>
            <input  onChange ={this.inputChange } />
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