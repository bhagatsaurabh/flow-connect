import{_ as f,o as v,c as y}from"./app.6c1464b6.js";const _={name:"LiveRunEvent",props:["play"],mounted(){this.flowConnect=new FlowConnect(this.$refs["example-custom-canvas"]),window.eventExampleFC=this.flowConnect;let t=this.flowConnect.createFlow({name:"Events Example",rules:{}}),i=t.createNode("common/timer",Vector.create(39.6,5.1),{state:{delay:500,lastBlink:0,isBlinking:!1,blinkDuration:20,emitValue:"Event from Timer1"}}),r=t.createNode("common/timer",Vector.create(39.6,126.8),{state:{delay:1e3,lastBlink:0,isBlinking:!1,blinkDuration:20,emitValue:"Event from Timer2"}}),c=t.createNode("common/timer",Vector.create(304.3,194),{state:{delay:200,lastBlink:0,isBlinking:!1,blinkDuration:20,emitValue:"Event from Timer3"}}),l=t.createNode("common/sync-event",Vector.create(262.8,57.8),{state:{lastBlink:0,isBlinking:!1,blinkDuration:20}}),s=t.createNode("common/sync-event",Vector.create(526.7,118.8),{state:{lastBlink:0,isBlinking:!1,blinkDuration:20}}),o=t.createNode("core/empty",Vector.create(746.7,82.8),{name:"Output",width:110,state:{isLogEnabled:!1},inputs:[{name:"out",dataType:"event"}]});o.ui.append(o.createUI("core/x-layout",{childs:[o.createUI("core/label",{text:"Log output ?"}),o.createUI("core/toggle",{height:10,propName:"isLogEnabled",style:{grow:1}})],style:{spacing:5}})),o.inputs[0].on("event",(n,e)=>{o.state.isLogEnabled&&console.log(e)}),i.outputs[0].connect(l.inputs[0]),r.outputs[0].connect(l.inputs[1]),l.outputs[0].connect(s.inputs[0]),c.outputs[0].connect(s.inputs[1]),s.outputs[0].connect(o.inputs[0]);let m=n=>{let e=this.flowConnect.time;[...n.node.nodeButtons.values()][1].style.color="#000",n.node.state.lastBlink=e};t.nodes.forEach(n=>{!n.outputs[0]||(n.addNodeButton(()=>null,(e,u,p)=>{let a=p.node.style,d=p.style;e.fillStyle=d.color||"transparent",e.strokeStyle="#000",e.beginPath(),e.arc(u.position.x+a.nodeButtonSize/2,u.position.y+a.nodeButtonSize/2,a.nodeButtonSize/2,0,2*Math.PI),e.stroke(),e.fill()},Align.Right),n.outputs[0]&&n.outputs[0].on("emit",e=>m(e)))}),t.on("tick",()=>{t.nodes.forEach(n=>{let e=[...n.nodeButtons.values()][1];e&&e.style.color==="#000"&&t.flowConnect.time-n.state.lastBlink>50&&(e.style.color="transparent")})}),this.flowConnect.on("stop",()=>{t.nodes.forEach(n=>{n.nodeButtons.size===2&&([...n.nodeButtons.values()][1].style.color="transparent")})}),this.flowConnect.render(t)},watch:{play(t){t?this.flowConnect.currFlow.start():this.flowConnect.currFlow.stop()}}},h={class:"example-canvas",ref:"example-custom-canvas"};function B(t,i,r,c,l,s){return v(),y("canvas",h,null,512)}var w=f(_,[["render",B],["__scopeId","data-v-422969eb"],["__file","LiveRunEvent.vue"]]);export{w as default};
