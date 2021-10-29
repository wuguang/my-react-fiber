function dfsForElementData(myElementData){
    let {type,props} = myElementData;
    let {id,children} = props;
    if(!id){
        id  = props.nodeValue;
    }
    console.log(`id = ${id}---beginWork`);
    if(Array.isArray(children) && children.length>0){
        children.forEach(item=>{
            dfsForElementData(item);
        });
    }
    console.log(`id = ${id}---completeWork`);
}
