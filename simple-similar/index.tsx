import React from './myReact/react';


function Start(){
    return <div>
        <h1>hello world~~</h1> 
        <h2>hello two ~~~</h2>
    </div>
}

let root = document.querySelectorAll('id');

React.render(root, <Start />);