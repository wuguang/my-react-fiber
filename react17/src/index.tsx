
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
const root = document.getElementById("react-fiber-root");

ReactDom.render(<>
<<<<<<< HEAD
    <SetTimer07 />
=======
    <SetTimer03 />
>>>>>>> db4b7f3c8b41bb766cb0a839ab01d9bf38bdcdb3
</>,root);



/*
<<<<<<< HEAD
    <SetTimer />
    <SetTimer02 />

=======
<SetTimer />
<SetTimer02 />
>>>>>>> db4b7f3c8b41bb766cb0a839ab01d9bf38bdcdb3
createRoot(root).render(<ConcurrentMode>
    <MainPage />
    <SetTimer />
</ConcurrentMode>);
*/
