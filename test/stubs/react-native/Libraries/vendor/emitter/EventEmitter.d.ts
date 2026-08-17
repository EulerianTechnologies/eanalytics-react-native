declare class EventEmitter { addListener(t:string,f:(...a:any[])=>void):any; emit(t:string,...a:any[]):void; }
export default EventEmitter;
