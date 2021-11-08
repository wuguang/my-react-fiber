
import React from 'react';
import ReactDom  from 'react-dom';
const {createRoot } = ReactDom as any;
const {
    ConcurrentMode,
} = React as any;

import MainPage from './mainPage';
import SetTimer from './components/setTimer';
import SetTimer02 from './components/setTimer02';
import SetTimer03 from './components/setTimer03';

import SetTimer07 from './components/setTimer07';

import {getHooks} from './hooks/myhooks';
const root = document.getElementById("react-fiber-root");


const Comp01 = ()=>{
    let {name,setName,age,setAge} = getHooks();

    const updateAge = ()=>{
        setAge(age+1);
    }
    return <div>
        <h2>Hello ,comp01</h2>
        <h3>{name}</h3>
        <h3>{age}</h3>
        <button onClick={updateAge}>update Age</button>
    </div>
}

const Comp02 = ()=>{
    let {name,setName,age,setAge} = getHooks();

    const updateAge = ()=>{
        setAge(age+1);
    }
    return <div>
        <h2>Hello ,comp02</h2>
        <h3>{name}</h3>
        <h3>{age}</h3>
        <button onClick={updateAge}>update Age</button>
    </div>
}
const Comp03 = ()=>{
    let {name,setName,age,setAge} = getHooks();

    const updateAge = ()=>{
        setAge(age+1);
    }
    return <div>
        <h2>Hello ,comp03</h2>
        <h3>{name}</h3>
        <h3>{age}</h3>
        <button onClick={updateAge}>update Age</button>
    </div>
}


ReactDom.render(<>
    <Comp01 />
    <Comp02 />
    <Comp03 />
</>,root);



/*
<SetTimer />
<SetTimer02 />
createRoot(root).render(<ConcurrentMode>
    <MainPage />
    <SetTimer />
</ConcurrentMode>);
*/
