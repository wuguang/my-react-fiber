let myElementData = {
    "type":"div",
    "props":{
        "id":"01",
    "children":[
    {"type":"h2",
    "props":{"id":"02",
    "children":[{"type":"TEXT","props":{"nodeValue":"hello world h2","children":[]}}]}},{"type":"div","props":{"id":"03","children":[{"type":"p","props":{"id":"04","children":[{"type":"span","props":{"id":"05","children":[{"type":"TEXT","props":{"nodeValue":"我是span","children":[]}}]}}]}}]}},{"type":"ul","props":{"id":"06","children":[{"type":"li","props":{"id":"07","children":[{"type":"TEXT","props":{"nodeValue":"我是1","children":[]}}]}},{"type":"li","props":{"id":"08","children":[{"type":"TEXT","props":{"nodeValue":"我是2","children":[]}}]}}]}},{"type":"h3","props":{"id":"09","children":[{"type":"TEXT","props":{"nodeValue":"hello world h3","children":[]}}]}}]}};


function dfsForElementData(myElementData){
    //myElementData
    let {props,type} = myElementData;
    let {id,children,nodeValue} = props;

    id = id || nodeValue;

    console.log(`id jin zhan = ${id}`);
    children.forEach(item=>{
        dfsForElementData(item);
    });
    console.log(`id chu zhan = ${id}`);

}

dfsForElementData(myElementData);