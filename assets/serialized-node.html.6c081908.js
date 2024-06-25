import{_ as i,r as d,o as r,c as a,b as s,a as o,w as n,e}from"./app.6c1464b6.js";const _={},l=s("h1",{id:"interface-serializednode",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#interface-serializednode","aria-hidden":"true"},"#"),e(" Interface: SerializedNode")],-1),c=e(`{
  hitColor: `),h=e("SerializedColor"),f=e(`,
  zIndex: number,
  focused: boolean,
  id: string,
  position: `),u=e("SerializedVector"),m=e(`,
  state: Record<string, any>,
  renderState: `),z=e("RenderState"),p=e(`,
  inputs: `),S=e("SerializedTerminal"),x=e(`[],
  outputs: `),y=e("SerializedTerminal"),N=e(`[],
  name: string,
  type: string,
  style: `),b=e("NodeStyle"),v=e(`,
  width: number
}
`);function g(C,R){const t=d("Ref");return r(),a("div",null,[l,s("pre",null,[c,o(t,{to:"../types/serialized-color"},{default:n(()=>[h]),_:1}),f,o(t,{to:"./serialized-vector"},{default:n(()=>[u]),_:1}),m,o(t,{to:"./render-state"},{default:n(()=>[z]),_:1}),p,o(t,{to:"./serialized-terminal"},{default:n(()=>[S]),_:1}),x,o(t,{to:"./serialized-terminal"},{default:n(()=>[y]),_:1}),N,o(t,{to:"./node-style"},{default:n(()=>[b]),_:1}),v])])}var w=i(_,[["render",g],["__file","serialized-node.html.vue"]]);export{w as default};
