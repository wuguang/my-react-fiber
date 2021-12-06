import React,{useState,memo,useMemo,useCallback} from 'react';

function SubCounter({onClick,data}){
    console.log('SubCounter render');
    return (
        <button onClick={onClick}>{data.number}</button>
    )
}

export  default  function Counter6(){
    console.log('Counter render');
    const [name,setName]= useState('计数器');
    const [number,setNumber] = useState(0);
    const data ={number};

    const addClick = ()=>{
        setNumber(number+1);
    };
    let MySubCounter = memo(SubCounter);

    return <div>
        <input type="text" value={name} onChange={(e)=>setName(e.target.value)} />
        <MySubCounter data={data} onClick={addClick}/>
    </div>

}
