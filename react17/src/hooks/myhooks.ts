import {useState,useMemo} from 'react';


export const getHooks = ()=>{
    let [name,setName] = useState('will');
    let [age,setAge] = useState(18);



    return {
        name,
        setName,
        age,
        setAge
    }
}