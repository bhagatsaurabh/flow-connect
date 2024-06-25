import{_ as p,r as a,o as u,c as m,b as t,a as s,w as o,u as f,e}from"./app.6c1464b6.js";const g=[{name:"constructor",type:"constructor"}],y=[{name:"dirtyNodes",type:"property"},{name:"graphNodes",type:"property"},{name:"nodes",type:"property"},{name:"state",type:"property"}],b=[{name:"propagate",type:"method"},{name:"debugNode",type:"method"},{name:"debugGraph",type:"method"}];var N={constructors:g,properties:y,methods:b};const G=t("h1",{id:"class-graph",tabindex:"-1"},[t("a",{class:"header-anchor",href:"#class-graph","aria-hidden":"true"},"#"),e(" Class: Graph")],-1),v=e("A directed acyclic graph containing references to all "),x=e("Nodes"),z=e(", assigns and updates their order of execution at runtime."),w=t("h2",{id:"hierarchy",tabindex:"-1"},[t("a",{class:"header-anchor",href:"#hierarchy","aria-hidden":"true"},"#"),e(" Hierarchy")],-1),S=t("h2",{id:"overview",tabindex:"-1"},[t("a",{class:"header-anchor",href:"#overview","aria-hidden":"true"},"#"),e(" Overview")],-1),F=t("h2",{id:"constructor",tabindex:"-1"},[t("a",{class:"header-anchor",href:"#constructor","aria-hidden":"true"},"#"),e(" Constructor")],-1),C=e(" new Graph(): "),k=e("Graph"),M=e("Graph"),P=t("h2",{id:"properties",tabindex:"-1"},[t("a",{class:"header-anchor",href:"#properties","aria-hidden":"true"},"#"),e(" Properties")],-1),B=t("h3",{id:"dirtynodes",tabindex:"-1"},[t("a",{class:"header-anchor",href:"#dirtynodes","aria-hidden":"true"},"#"),e(" dirtyNodes")],-1),H=e("Map<string, "),O=e("GraphNode"),V=e(">"),A=e(" Collection of all the higher-order "),I=e("GraphNodes"),R=e(" that will be executed in next cycle (mapped to "),E=e("GraphNode.id"),T=e("). "),j=t("h3",{id:"graphnodes",tabindex:"-1"},[t("a",{class:"header-anchor",href:"#graphnodes","aria-hidden":"true"},"#"),e(" graphNodes")],-1),q=e("Map<string, "),D=e("GraphNode"),J=e(">"),K=e(" Collection of all the "),L=e("GraphNodes"),Q=e(" mapped to "),U=e("Node.id"),W=e(". "),X=t("h3",{id:"nodes",tabindex:"-1"},[t("a",{class:"header-anchor",href:"#nodes","aria-hidden":"true"},"#"),e(" nodes")],-1),Y=e("GraphNode[][]"),Z=e(" A collection of all the "),$=e("GraphNodes"),ee=e(" grouped and indexed by their "),te=e("order"),oe=e("."),se=t("br",null,null,-1),de=e(" For e.g. nodes[0] stores all the "),ae=e("GraphNodes"),ne=e(" that has order 0 and so on. "),re=t("h3",{id:"state",tabindex:"-1"},[t("a",{class:"header-anchor",href:"#state","aria-hidden":"true"},"#"),e(" state")],-1),ie=e("FlowState"),_e=e(" Current state of the "),he=e("Flow"),ce=e(". "),le=e("FlowState"),pe=e(".Stopped"),ue=t("h2",{id:"methods",tabindex:"-1"},[t("a",{class:"header-anchor",href:"#methods","aria-hidden":"true"},"#"),e(" Methods")],-1),me=t("h3",{id:"propagate",tabindex:"-1"},[t("a",{class:"header-anchor",href:"#propagate","aria-hidden":"true"},"#"),e(" propagate")],-1),fe=e(" propagate("),ge=t("strong",null,"root: ",-1),ye=e("Node"),be=e(" | "),Ne=e("GraphNode"),Ge=e(", "),ve=t("strong",null,"callback: ",-1),xe=e("(node: "),ze=e("Node"),we=e(") => void"),Se=e("): "),Fe=t("em",null,"void",-1),Ce=e("Node"),ke=e(" | "),Me=e("GraphNode"),Pe=e("(node: "),Be=e("Node"),He=e(") => void"),Oe=t("em",null,"void",-1),Ve=e(" Generic breadth-first traverser for "),Ae=e("Graph"),Ie=e(". "),Re=t("h3",{id:"debugnode",tabindex:"-1"},[t("a",{class:"header-anchor",href:"#debugnode","aria-hidden":"true"},"#"),e(" debugNode")],-1),Ee=e(" debugNode("),Te=t("strong",null,"node: ",-1),je=e("GraphNode"),qe=e(", "),De=t("strong",null,"indent: ",-1),Je=t("em",null,"string",-1),Ke=e("): "),Le=t("em",null,"void",-1),Qe=e("GraphNode"),Ue=t("em",null,"string",-1),We=t("em",null,"void",-1),Xe=t("h3",{id:"debuggraph",tabindex:"-1"},[t("a",{class:"header-anchor",href:"#debuggraph","aria-hidden":"true"},"#"),e(" debugGraph")],-1),Ye=e(" debugGraph(): "),Ze=t("em",null,"void",-1),$e=t("em",null,"void",-1),et=t("h3",{id:"serialize",tabindex:"-1"},[t("a",{class:"header-anchor",href:"#serialize","aria-hidden":"true"},"#"),e(" serialize")],-1),tt=e(" serialize(): "),ot=e("SerializedGraph"),st=e(" of "),dt=e("Serializable"),at=e("."),nt=e("serialize"),rt=e("SerializedGraph"),it=t("h3",{id:"deserialize",tabindex:"-1"},[t("a",{class:"header-anchor",href:"#deserialize","aria-hidden":"true"},"#"),e(" deSerialize")],-1),_t=e(" deSerialize("),ht=t("strong",null,"flow: ",-1),ct=e("Flow"),lt=e(", "),pt=t("strong",null,"data: ",-1),ut=e("SerializedGraph"),mt=e("): "),ft=e("Graph"),gt=e("Flow"),yt=e("SerializedGraph"),bt=e("Graph"),Nt={__name:"graph.html",setup(Gt){return(vt,xt)=>{const d=a("Ref"),_=a("Hierarchy"),h=a("Overview"),n=a("Method"),i=a("Property"),r=a("Param"),c=a("Function"),l=a("Icon");return u(),m("div",null,[G,t("p",null,[v,s(d,{to:"./node"},{default:o(()=>[x]),_:1}),z]),w,t("p",null,[s(_,{implement:[{name:"Serializable",link:"../interfaces/serializable.html"}]},null,8,["implement"])]),S,s(h,{data:f(N)},null,8,["data"]),F,s(n,{type:"constructor"},{signature:o(()=>[C,t("em",null,[s(d,{to:"#class-graph"},{default:o(()=>[k]),_:1})])]),return:o(()=>[t("em",null,[s(d,{to:"#class-graph"},{default:o(()=>[M]),_:1})])]),_:1}),P,B,s(i,{type:"property",name:"dirtyNodes"},{type:o(()=>[t("em",null,[H,s(d,{to:"./graph-node"},{default:o(()=>[O]),_:1}),V])]),desc:o(()=>[A,s(d,{to:"./graph-node"},{default:o(()=>[I]),_:1}),R,s(d,{to:"./graph-node#id"},{default:o(()=>[E]),_:1}),T]),_:1}),j,s(i,{type:"property",name:"graphNodes"},{type:o(()=>[t("em",null,[q,s(d,{to:"./graph-node"},{default:o(()=>[D]),_:1}),J])]),desc:o(()=>[K,s(d,{to:".graph-node"},{default:o(()=>[L]),_:1}),Q,s(d,{to:"./node#id"},{default:o(()=>[U]),_:1}),W]),_:1}),X,s(i,{type:"property",name:"nodes"},{type:o(()=>[t("em",null,[s(d,{to:"./graph-node"},{default:o(()=>[Y]),_:1})])]),desc:o(()=>[Z,s(d,{to:"./graph-node"},{default:o(()=>[$]),_:1}),ee,s(d,{to:"./graph-node#order"},{default:o(()=>[te]),_:1}),oe,se,de,s(d,{to:"./graph-node"},{default:o(()=>[ae]),_:1}),ne]),_:1}),re,s(i,{type:"property",name:"state"},{type:o(()=>[t("em",null,[s(d,{to:"../enums/flow-state"},{default:o(()=>[ie]),_:1})])]),desc:o(()=>[_e,s(d,{to:"./flow"},{default:o(()=>[he]),_:1}),ce]),default:o(()=>[t("em",null,[s(d,{to:"../enums/flow-state"},{default:o(()=>[le]),_:1}),pe])]),_:1}),ue,me,s(n,{type:"method"},{signature:o(()=>[fe,ge,t("em",null,[s(d,{to:"./node"},{default:o(()=>[ye]),_:1}),be,s(d,{to:"./graph-node"},{default:o(()=>[Ne]),_:1})]),Ge,ve,t("em",null,[xe,s(d,{to:"./node"},{default:o(()=>[ze]),_:1}),we]),Se,Fe]),params:o(()=>[s(r,{name:"root"},{default:o(()=>[t("em",null,[s(d,{to:"./node"},{default:o(()=>[Ce]),_:1}),ke,s(d,{to:"./graph-node"},{default:o(()=>[Me]),_:1})])]),_:1}),s(r,{name:"callback"},{default:o(()=>[t("em",null,[s(c,{class:"mr-0p5"}),t("em",null,[Pe,s(d,{to:"./node"},{default:o(()=>[Be]),_:1}),He])])]),_:1})]),return:o(()=>[Oe]),desc:o(()=>[Ve,s(d,{to:"#class-graph"},{default:o(()=>[Ae]),_:1}),Ie]),_:1}),Re,s(n,{type:"method"},{signature:o(()=>[Ee,Te,t("em",null,[s(d,{to:"./graph-node"},{default:o(()=>[je]),_:1})]),qe,De,Je,Ke,Le]),params:o(()=>[s(r,{name:"node"},{default:o(()=>[t("em",null,[s(d,{to:"./graph-node"},{default:o(()=>[Qe]),_:1})])]),_:1}),s(r,{name:"indent"},{default:o(()=>[Ue]),_:1})]),return:o(()=>[We]),_:1}),Xe,s(n,{type:"method"},{signature:o(()=>[Ye,Ze]),return:o(()=>[$e]),_:1}),et,s(n,{type:"method-implementation"},{signature:o(()=>[tt,t("em",null,[s(d,{to:"../interfaces/serialized-graph"},{default:o(()=>[ot]),_:1})])]),inherit:o(()=>[s(l,{valign:"bottom",type:"implementation"}),st,s(d,{to:"../interfaces/serializable"},{default:o(()=>[dt]),_:1}),at,s(d,{to:"../interfaces/serializable#serialize"},{default:o(()=>[nt]),_:1})]),return:o(()=>[t("em",null,[s(d,{to:"../interfaces/serialized-graph"},{default:o(()=>[rt]),_:1})])]),_:1}),it,s(n,{type:"method-static"},{signature:o(()=>[_t,ht,t("em",null,[s(d,{to:"./flow"},{default:o(()=>[ct]),_:1})]),lt,pt,t("em",null,[s(d,{to:"../interfaces/serialized-graph"},{default:o(()=>[ut]),_:1})]),mt,t("em",null,[s(d,{to:"#class-graph"},{default:o(()=>[ft]),_:1})])]),params:o(()=>[s(r,{name:"flow"},{default:o(()=>[t("em",null,[s(d,{to:"./flow"},{default:o(()=>[gt]),_:1})])]),_:1}),s(r,{name:"data"},{default:o(()=>[t("em",null,[s(d,{to:"../interfaces/serialized-graph"},{default:o(()=>[yt]),_:1})])]),_:1})]),return:o(()=>[t("em",null,[s(d,{to:"#class-graph"},{default:o(()=>[bt]),_:1})])]),_:1})])}}};var wt=p(Nt,[["__file","graph.html.vue"]]);export{wt as default};