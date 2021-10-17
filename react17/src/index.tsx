
import React from 'react';
import ReactDom  from 'react-dom';
const {unstable_createRoot:createRoot } = ReactDom as any;
const {
    ConcurrentMode,
} = React as any;

import MainPage from './mainPage';
const root = document.getElementById("react-fiber-root");

//ReactDom.render(<MainPage />,root);

createRoot(root).render(<ConcurrentMode>
    <MainPage />
</ConcurrentMode>)
