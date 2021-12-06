import React,{useState} from 'react';

export default function Counter(){
    let [number,setNumber] = useState(0);
    function lazy(){
        setTimeout(() => {
            // setNumber(number+1);
            // 这样每次执行时都会去获取一遍 state，而不是使用点击触发时的那个 state
            setNumber(number=>{
                alert(number+1);
                return number + 1;
            });

        }, 3000);
    }
    
    return <>
        <p>{number}</p>
        <button onClick={()=>setNumber(number+1)}>+</button>
        <button onClick={lazy}>lazy</button>
    </>;
}
