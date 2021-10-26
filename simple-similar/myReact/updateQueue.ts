export class UpdateQueue{
    firstUpdate = null;
    lastUpdate = null;

    constructor(){
        this.firstUpdate = null;
        this.lastUpdate = null;
    }

    enqueueUpdate(update){
        if(this.lastUpdate === null){
            this.firstUpdate = this.lastUpdate = update;
        }else{
            this.lastUpdate.nextUpdate = update;
            this.lastUpdate = update;
        }
    }
    
    forceUpdate(state){
        let currentUpdate = this.firstUpdate;
        while(currentUpdate){
            let nextState = typeof currentUpdate.payload === 'function'?currentUpdate.payload(state):currentUpdate.payload;
            state = {...state,...nextState};
            currentUpdate = currentUpdate.nextUpdate;
        }
        this.firstUpdate = this.lastUpdate = null;
        return state;
    }

}

export class Update{
    //let nextState = typeof currentUpdate.payload === 'function'?currentUpdate.payload(state):currentUpdate.payload;
    //pay可能为函数
    payload = null;
    constructor(payload){
        this.payload = payload;
    }
  
}