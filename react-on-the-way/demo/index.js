import {React, ReactDOM} from '../packages';

const {useState, useEffect} = React;

function App() {
    const [name,setName] = useState('');
    const [num,setNum] = useState(0);
    const [age,setAge] = useState(18);


    useEffect(() => {
        setName(name + '_'+num);
    }, [num]);

    useEffect(() => {
        setNum(num+1);
    }, [age]);


    const btnClick = ()=>{ 
        setAge(age + 1);
    }

    /*
    useEffect(() => {
        document.title = `${name} ${even}`;
    }, [even]);


    setTimeout(() => {
        updateEven(even + 2);
        updateOdd(odd + 2);  
    }, 2000);
    */


    return <div>
        <p>{num}</p>
        <h2>
            name = ${name}---num = ${num}---- age = ${age}
        </h2>
        <div>
            <button onClick={btnClick}>click</button>
        </div>
    </div>
}

ReactDOM.render(<App name="Hello"/>, document.querySelector('#app'));