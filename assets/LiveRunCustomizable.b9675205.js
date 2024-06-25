import{_ as p,o as x,c as z}from"./app.6c1464b6.js";const S={name:"LiveRunCustomizable",props:["play"],mounted(){this.flowConnect=new FlowConnect(this.$refs["example-custom-canvas"]),window.customExampleFC=this.flowConnect;let s=this.flowConnect.createFlow({name:"Customization Example",ruleColors:{event:"#ff8787",number:"#b7ff87",boolean:"#87afff",string:"#ff87c9",any:"red"}}),u=s.createNode("common/timer",Vector.create(22.6,1.2),{state:{delay:700},style:{padding:15,spacing:20,rowHeight:20,color:"#555",titleColor:"green",titleHeight:30,terminalRowHeight:25,terminalStripMargin:4,maximizeButtonColor:"#df87ff",expandButtonColor:"blueviolet",minimizedTerminalColor:"#87dfff",nodeButtonSize:10,nodeButtonSpacing:10,outlineColor:"#ffa200"}});u.ui.style={backgroundColor:"#6ba4ff",shadowColor:"white",shadowBlur:0,shadowOffset:Vector.Zero(),borderColor:"#0062ff",borderWidth:8};let c=u.ui.query("core/input")[0].children[0];c.style.backgroundColor="#fff",c.style.color="#000";let y=s.createNode("common/timer",Vector.create(22.6,194.7),{state:{delay:600}});y.ui.style={backgroundColor:"#ffb561",shadowColor:"#999",shadowBlur:10,shadowOffset:Vector.Zero(),borderColor:"#ffb561",borderWidth:0};let n=s.createNode("common/random",Vector.create(321.5,6.7),{state:{min:0,max:5}});n.ui.style.backgroundColor="#f7ff99";let b={color:"#547053",font:"courier"};n.ui.query("core/label").forEach(t=>Object.assign(t.style,b)),n.ui.query("core/input").forEach(t=>t.children[0].style.backgroundColor="#abff45");let i=s.createNode("core/empty",Vector.create(615.3,79.8),{name:"Custom",width:200,state:{preset:"default",renderer:0}}),C=i.createUI("core/select",{values:["default","dark","transparent","red","green"],propName:"preset",height:15,input:!0,style:{fontSize:"13px",grow:1}}),d=i.createUI("core/button",{text:"Custom Renderers",input:!0});i.ui.append([i.createUI("core/x-layout",{childs:[i.createUI("core/label",{text:"Preset"}),C],style:{spacing:15}}),d]);let g=i.ui.query("core/label"),w=i.ui.query("core/select"),a=()=>{g.forEach(t=>t.style.color="#000"),w.forEach(t=>t.style.arrowColor="#000"),d.style.backgroundColor="#666",d.children[0].style.color="#fff"},k=()=>{g.forEach(t=>t.style.color="#fff"),w.forEach(t=>t.style.arrowColor="#fff"),d.style.backgroundColor="#fff",d.children[0].style.color="#000"};i.watch("preset",(t,e)=>{switch(e==="dark"?k():a(),e){case"default":i.ui.style.backgroundColor="#ddd";break;case"dark":i.ui.style.backgroundColor="#000";break;case"transparent":i.ui.style.backgroundColor="transparent";break;case"red":i.ui.style.backgroundColor="#ff8080";break;case"green":i.ui.style.backgroundColor="#b1ff80";break;default:return}}),d.on("click",()=>i.state.renderer=(i.state.renderer+1)%3),i.ui.style.shadowOffset=Vector.Zero(),i.ui.style.shadowBlur=20,i.ui.style.borderWidth=0;let v=[(t,e)=>{t.strokeRect(e.position.x,e.position.y,e.width,e.height),t.fillRect(e.position.x,e.position.y,e.width,e.height)},(t,e)=>{t.beginPath();let o=i.width/9,l=e.position.x;t.moveTo(l,e.position.y),t.bezierCurveTo(l+=o,e.position.y-10,l+=o,e.position.y-10,l+=o,e.position.y),t.bezierCurveTo(l+=o,e.position.y+10,l+=o,e.position.y+10,l+=o,e.position.y),t.bezierCurveTo(l+=o,e.position.y-10,l+=o,e.position.y-10,l+=o,e.position.y),t.lineTo(l,e.position.y+e.height),t.lineTo(e.position.x,e.position.y+e.height),t.lineTo(e.position.x,e.position.y),t.closePath(),t.stroke(),t.fill()},(t,e)=>{t.beginPath(),t.moveTo(e.position.x,e.position.y),t.lineTo(e.position.x+e.width,e.position.y),t.lineTo(e.position.x+e.width+20,e.position.y+e.height/2),t.lineTo(e.position.x+e.width,e.position.y+e.height),t.lineTo(e.position.x,e.position.y+e.height),t.lineTo(e.position.x-20,e.position.y+e.height/2),t.lineTo(e.position.x,e.position.y),t.closePath(),t.stroke(),t.fill()}];i.renderers.background=t=>(e,o)=>{Object.assign(e,{fillStyle:t.style.backgroundColor,strokeStyle:t.style.borderColor,shadowColor:t.style.shadowColor,shadowBlur:t.style.shadowBlur,lineWidth:t.style.borderWidth,shadowOffsetX:t.style.shadowOffset.x,shadowOffsetY:t.style.shadowOffset.y}),v[i.state.renderer](e,o)};let _=(t,e,o)=>{o.offset||(o.offset=1),o.offset+=.5,o.offset>16&&(o.offset=0),t.strokeStyle="green",t.lineWidth=2,t.setLineDash([8,8]),t.lineDashOffset=-o.offset,t.beginPath(),t.moveTo(e.start.x,e.start.y),t.lineTo(e.end.x,e.end.y),t.stroke()},T=(t,e,o)=>{let l=Math.abs(e.end.x-e.start.x),r=[];r.push({x:e.start.x,y:e.start.y}),e.start.x>e.end.x?(r.push({x:e.start.x+20,y:e.start.y}),r.push({x:e.start.x+20,y:e.start.y+(e.end.y-e.start.y)/2}),r.push({x:e.end.x-20,y:e.end.y+(e.start.y-e.end.y)/2}),r.push({x:e.end.x-20,y:e.end.y})):(r.push({x:e.start.x+l/2,y:e.start.y}),r.push({x:e.start.x+l/2,y:e.end.y})),r.push({x:e.end.x,y:e.end.y}),t.strokeStyle="black",t.lineWidth=8,t.beginPath(),t.moveTo(r[0].x,r[0].y),r.forEach(f=>t.lineTo(f.x,f.y)),t.stroke(),t.strokeStyle="white",t.lineWidth=4;let h=Vector.Distance(e.start.x,e.start.y,e.end.x,e.end.y);o.offset||(o.offset=1),o.offset+=h/100,o.offset>h*1.5&&(o.offset=0),t.setLineDash([h/2,h]),t.lineDashOffset=-o.offset,t.beginPath(),t.moveTo(r[0].x,r[0].y),r.forEach(f=>t.lineTo(f.x,f.y)),t.stroke()};this.flowConnect.registerRenderer("connector",t=>{if((t.start&&t.start.dataType)==="event"||(t.end&&t.end.dataType)==="event")return _}),s.renderers.connector=t=>{if(t.start&&t.start.node===y)return T},u.outputs[0].connect(n.inputs[0]),n.outputs[0].connect(i.inputsUI[0]),y.outputs[0].connect(i.inputsUI[1]),this.flowConnect.render(s)},watch:{play(s){s?this.flowConnect.currFlow.start():this.flowConnect.currFlow.stop()}}},B={class:"example-canvas",ref:"example-custom-canvas"};function E(s,u,c,y,n,b){return x(),z("canvas",B,null,512)}var V=p(S,[["render",E],["__scopeId","data-v-521395dd"],["__file","LiveRunCustomizable.vue"]]);export{V as default};