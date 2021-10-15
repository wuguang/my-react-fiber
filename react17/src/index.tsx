

import React from 'react';
import ReactDom  from 'react-dom';
//import {creatRoot} from 'ReactDomRoot';
import MainPage from './mainPage';


// ReactDOM.render(<App/>, rootEl);   
let root = document.getElementById('react-fiber-root');
(ReactDom as any).createRoot(root).render(<MainPage />); 
