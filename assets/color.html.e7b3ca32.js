import{_ as u,r as i,o as m,c as p,a as s,u as g,w as o,b as e,e as t}from"./app.6c1464b6.js";const b=[],y=[{name:"hexValue",type:"property"},{name:"rgbaString",type:"property"},{name:"rgbaCSSString",type:"property"},{name:"rgbaValue",type:"property"}],f=[{name:"create",type:"method-static"},{name:"isEqual",type:"method"},{name:"rgbaToHex",type:"method-static"},{name:"serialize",type:"method-implementation"},{name:"hexToRGBA",type:"method-static"},{name:"rgbaToString",type:"method-static"},{name:"Random",type:"method-static"},{name:"rgbaToCSSString",type:"method-static"},{name:"scale",type:"method-static"}];var x={constructors:b,properties:y,methods:f};const C=e("h1",{id:"class-color",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#class-color","aria-hidden":"true"},"#"),t(" Class: Color")],-1),S=e("p",null,"A general purpose RGBA color class with a few utility functions.",-1),z=e("h2",{id:"hierarchy",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#hierarchy","aria-hidden":"true"},"#"),t(" Hierarchy")],-1),v=e("h2",{id:"overview",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#overview","aria-hidden":"true"},"#"),t(" Overview")],-1),A=e("h2",{id:"properties",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#properties","aria-hidden":"true"},"#"),t(" Properties")],-1),T=e("h3",{id:"hexvalue",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#hexvalue","aria-hidden":"true"},"#"),t(" hexValue")],-1),U=e("em",null,"string",-1),w=t("Example: "),R=e("code",null,"#34488e",-1),V=e("h3",{id:"rgbacssstring",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#rgbacssstring","aria-hidden":"true"},"#"),t(" rgbaCSSString")],-1),E=e("em",null,"string",-1),B=t("Example: "),H=e("code",null,"rgba(52, 72, 142, 255)",-1),q=e("h3",{id:"rgbastring",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#rgbastring","aria-hidden":"true"},"#"),t(" rgbaString")],-1),P=e("em",null,"string",-1),G=t("Example: "),k=e("code",null,"52:72:142:255",-1),M=e("h3",{id:"rgbavalue",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#rgbavalue","aria-hidden":"true"},"#"),t(" rgbaValue")],-1),N=e("em",null,"Uint8ClampedArray",-1),O=t(" | "),F=e("em",null,"number[]",-1),I=t("Example: "),j=e("code",null,"[52, 72, 142, 255]",-1),D=e("h2",{id:"methods",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#methods","aria-hidden":"true"},"#"),t(" Methods")],-1),J=e("h3",{id:"create",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#create","aria-hidden":"true"},"#"),t(" create")],-1),K=t(" create("),L=e("strong",null,"data: ",-1),Q=t("SerializedColor"),W=t("): "),X=t("Color"),Y=t("SerializedColor"),Z=t("Color"),$=e("h3",{id:"isequal",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#isequal","aria-hidden":"true"},"#"),t(" isEqual")],-1),ee=t(" isEqual("),te=e("strong",null,"color: ",-1),oe=t("Color"),se=t("): "),ne=e("em",null,"boolean",-1),ae=t("Color"),re=e("em",null,"boolean",-1),ie=t(" Compares two colors by its individual rgba components. "),le=e("h3",{id:"serialize",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#serialize","aria-hidden":"true"},"#"),t(" serialize")],-1),de=t(" serialize(): "),_e=t("SerializedColor"),ce=t(" of "),he=t("Serializable"),ue=t("."),me=t("serialize"),pe=t("SerializedColor"),ge=e("h3",{id:"random",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#random","aria-hidden":"true"},"#"),t(" Random")],-1),be=t(" Random(): "),ye=t("Color"),fe=t("Color"),xe=e("h3",{id:"deserialize",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#deserialize","aria-hidden":"true"},"#"),t(" deSerialize")],-1),Ce=t(" deSerialize("),Se=e("strong",null,"data: ",-1),ze=t("SerializedColor"),ve=t("): "),Ae=t("Color"),Te=t("SerializedColor"),Ue=t("Color"),we=e("h3",{id:"hextorgba",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#hextorgba","aria-hidden":"true"},"#"),t(" hexToRGBA")],-1),Re=t(" hexToRGBA("),Ve=e("strong",null,"hex: ",-1),Ee=e("em",null,"string",-1),Be=t("): "),He=e("em",null,"Uint8ClampedArray",-1),qe=e("em",null,"string",-1),Pe=e("em",null,"Uint8ClampedArray",-1),Ge=e("h3",{id:"rgbatocssstring",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#rgbatocssstring","aria-hidden":"true"},"#"),t(" rgbaToCSSString")],-1),ke=t(" rgbaToCSSString("),Me=e("strong",null,"rgba: ",-1),Ne=e("em",null,"Uint8ClampedArray",-1),Oe=t(" | "),Fe=e("em",null,"number[]",-1),Ie=t("): "),je=e("em",null,"string",-1),De=e("em",null,"Uint8ClampedArray",-1),Je=t(" | "),Ke=e("em",null,"number[]",-1),Le=e("em",null,"string",-1),Qe=e("h3",{id:"rgbatohex",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#rgbatohex","aria-hidden":"true"},"#"),t(" rgbaToHex")],-1),We=t(" rgbaToHex("),Xe=e("strong",null,"rgba: ",-1),Ye=e("em",null,"Uint8ClampedArray",-1),Ze=t(" | "),$e=e("em",null,"number[]",-1),et=t("): "),tt=e("em",null,"string",-1),ot=e("em",null,"Uint8ClampedArray",-1),st=t(" | "),nt=e("em",null,"number[]",-1),at=e("em",null,"string",-1),rt=e("h3",{id:"rgbatostring",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#rgbatostring","aria-hidden":"true"},"#"),t(" rgbaToString")],-1),it=t(" rgbaToString("),lt=e("strong",null,"rgba: ",-1),dt=e("em",null,"Uint8ClampedArray",-1),_t=t(" | "),ct=e("em",null,"number[]",-1),ht=t("): "),ut=e("em",null,"string",-1),mt=e("em",null,"Uint8ClampedArray",-1),pt=t(" | "),gt=e("em",null,"number[]",-1),bt=e("em",null,"string",-1),yt=e("h3",{id:"scale",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#scale","aria-hidden":"true"},"#"),t(" scale")],-1),ft=t(" scale("),xt=e("strong",null,"colors: ",-1),Ct=e("em",null,"string[]",-1),St=t(" | "),zt=e("em",null,"Uint8ClampedArray",-1),vt=t(" | "),At=t("Color"),Tt=t("[]"),Ut=t(" | "),wt=e("em",null,"number[][]",-1),Rt=t("): "),Vt=e("em",null,"(t: number) => string",-1),Et=t(" Returns a linear interpolation function for given array of colors. "),Bt=e("em",null,"string[]",-1),Ht=t(" | "),qt=e("em",null,"Uint8ClampedArray",-1),Pt=t(" | "),Gt=t("Color"),kt=t("[]"),Mt=t(" | "),Nt=e("em",null,"number[][]",-1),Ot=e("br",null,null,-1),Ft=e("em",null,"(t: number) => string",-1),It={__name:"color.html",setup(jt){return(Dt,Jt)=>{const d=i("Hierarchy"),_=i("Overview"),l=i("Property"),n=i("Ref"),r=i("Param"),a=i("Method"),c=i("Icon"),h=i("Function");return m(),p("div",null,[C,S,z,s(d,{implement:[{name:"Serializable",link:"../interfaces/serializable.html"}]},null,8,["implement"]),v,s(_,{data:g(x)},null,8,["data"]),A,T,s(l,{type:"property",name:"hexValue"},{type:o(()=>[U]),desc:o(()=>[w,R]),_:1}),V,s(l,{type:"property",name:"rgbaCSSString"},{type:o(()=>[E]),desc:o(()=>[B,H]),_:1}),q,s(l,{type:"property",name:"rgbaString"},{type:o(()=>[P]),desc:o(()=>[G,k]),_:1}),M,s(l,{type:"property",name:"rgbaValue"},{type:o(()=>[N,O,F]),desc:o(()=>[I,j]),_:1}),D,J,s(a,{type:"method-static"},{signature:o(()=>[K,L,e("em",null,[s(n,{to:"../types/serialized-color"},{default:o(()=>[Q]),_:1})]),W,e("em",null,[s(n,{to:"./color"},{default:o(()=>[X]),_:1})])]),params:o(()=>[s(r,{name:"data"},{default:o(()=>[e("em",null,[s(n,{to:"../types/serialized-color"},{default:o(()=>[Y]),_:1})])]),_:1})]),return:o(()=>[e("em",null,[s(n,{to:"./color"},{default:o(()=>[Z]),_:1})])]),_:1}),$,s(a,{type:"method"},{signature:o(()=>[ee,te,e("em",null,[s(n,{to:"./color"},{default:o(()=>[oe]),_:1})]),se,ne]),params:o(()=>[s(r,{name:"color"},{default:o(()=>[e("em",null,[s(n,{to:"./color"},{default:o(()=>[ae]),_:1})])]),_:1})]),return:o(()=>[re]),example:o(()=>[ie]),_:1}),le,s(a,{type:"method-implementation"},{signature:o(()=>[de,e("em",null,[s(n,{to:"../types/serialized-color"},{default:o(()=>[_e]),_:1})])]),inherit:o(()=>[s(c,{valign:"bottom",type:"implementation"}),ce,s(n,{to:"../interfaces/serializable"},{default:o(()=>[he]),_:1}),ue,s(n,{to:"../interfaces/serializable#serialize"},{default:o(()=>[me]),_:1})]),return:o(()=>[e("em",null,[s(n,{to:"../types/serialized-color"},{default:o(()=>[pe]),_:1})])]),_:1}),ge,s(a,{type:"method-static"},{signature:o(()=>[be,e("em",null,[s(n,{to:"#class-color"},{default:o(()=>[ye]),_:1})])]),return:o(()=>[e("em",null,[s(n,{to:"#class-color"},{default:o(()=>[fe]),_:1})])]),_:1}),xe,s(a,{type:"method-static"},{signature:o(()=>[Ce,Se,e("em",null,[s(n,{to:"../types/serialized-color"},{default:o(()=>[ze]),_:1})]),ve,e("em",null,[s(n,{to:"#class-color"},{default:o(()=>[Ae]),_:1})])]),params:o(()=>[s(r,{name:"data"},{default:o(()=>[e("em",null,[s(n,{to:"../types/serialized-color"},{default:o(()=>[Te]),_:1})])]),_:1})]),return:o(()=>[e("em",null,[s(n,{to:"#class-color"},{default:o(()=>[Ue]),_:1})])]),_:1}),we,s(a,{type:"method-static"},{signature:o(()=>[Re,Ve,Ee,Be,He]),params:o(()=>[s(r,{name:"hex"},{default:o(()=>[qe]),_:1})]),return:o(()=>[Pe]),_:1}),Ge,s(a,{type:"method-static"},{signature:o(()=>[ke,Me,Ne,Oe,Fe,Ie,je]),params:o(()=>[s(r,{name:"rgba"},{default:o(()=>[De,Je,Ke]),_:1})]),return:o(()=>[Le]),_:1}),Qe,s(a,{type:"method-static"},{signature:o(()=>[We,Xe,Ye,Ze,$e,et,tt]),params:o(()=>[s(r,{name:"rgba"},{default:o(()=>[ot,st,nt]),_:1})]),return:o(()=>[at]),_:1}),rt,s(a,{type:"method-static"},{signature:o(()=>[it,lt,dt,_t,ct,ht,ut]),params:o(()=>[s(r,{name:"rgba"},{default:o(()=>[mt,pt,gt]),_:1})]),return:o(()=>[bt]),_:1}),yt,s(a,{type:"method-static"},{signature:o(()=>[ft,xt,Ct,St,zt,vt,e("em",null,[s(n,{to:"#class-color"},{default:o(()=>[At]),_:1}),Tt]),Ut,wt,Rt,Vt]),desc:o(()=>[Et]),params:o(()=>[s(r,{name:"colors"},{default:o(()=>[Bt,Ht,qt,Pt,e("em",null,[s(n,{to:"#class-color"},{default:o(()=>[Gt]),_:1}),kt]),Mt,Nt]),_:1})]),return:o(()=>[Ot,e("strong",null,[s(h,{class:"mr-0p5"})]),Ft]),_:1})])}}};var Lt=u(It,[["__file","color.html.vue"]]);export{Lt as default};
