
import React from 'react';
import ReactDom  from 'react-dom';
const {createRoot } = ReactDom as any;
const {
    ConcurrentMode,
} = React as any;

import MainPage from './mainPage';
import SetTimer from './components/setTimer';
import SetTimer02 from './components/setTimer02';
import SetTimer07 from './components/setTimer07';
const root = document.getElementById("react-fiber-root");

ReactDom.render(<>
    <SetTimer />
    <SetTimer02 />
    <SetTimer07 />
</>,root);

/*
createRoot(root).render(<ConcurrentMode>
    <MainPage />
    <SetTimer />
</ConcurrentMode>);
*/
