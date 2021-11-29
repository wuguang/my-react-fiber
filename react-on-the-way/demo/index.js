import {React, ReactDOM} from '../packages';

const {useState, useEffect} = React;

function App({name}) {
    const [num,setNum] = useState(0);

    const btnClick = ()=>{
        setNum(num=>{
            return num + 1;
        });

        console.log('hello world~~');
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
        <div>
            <button onClick={btnClick}>click</button>
        </div>
    </div>
}

ReactDOM.render(<App name="Hello"/>, document.querySelector('#app'));