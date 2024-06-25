import{_ as p,r as s,o as i,c as r,a as e,b as n,w as l,e as a,d as c}from"./app.6c1464b6.js";var d="/flow-connect/images/standard-nodes/visual/line-chart-mini.png";const u={},k=n("h2",{id:"standardnode-linechartmini",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#standardnode-linechartmini","aria-hidden":"true"},"#"),a(" StandardNode: LineChartMini")],-1),h=n("img",{class:"zoomable",alt:"LineChartMini standard node",src:d},null,-1),m=c(`<br><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token keyword">let</span> chart <span class="token operator">=</span> flow<span class="token punctuation">.</span><span class="token function">createNode</span><span class="token punctuation">(</span><span class="token string">&quot;visual/line-chart-mini&quot;</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>
  <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&quot;Example&quot;</span><span class="token punctuation">,</span>
  <span class="token literal-property property">width</span><span class="token operator">:</span> <span class="token number">250</span><span class="token punctuation">,</span>
  <span class="token literal-property property">displayHeight</span><span class="token operator">:</span> <span class="token number">100</span><span class="token punctuation">,</span>
  <span class="token literal-property property">displayStyle</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token literal-property property">backgroundColor</span><span class="token operator">:</span> <span class="token string">&quot;#7a7a7a&quot;</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><br><h3 id="default-state" tabindex="-1"><a class="header-anchor" href="#default-state" aria-hidden="true">#</a> Default State</h3><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token punctuation">{</span>
  <span class="token literal-property property">size</span><span class="token operator">:</span> <span class="token number">10</span><span class="token punctuation">;</span>
  <span class="token literal-property property">colors</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">&quot;#ff6666&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;#66d4ff&quot;</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="options" tabindex="-1"><a class="header-anchor" href="#options" aria-hidden="true">#</a> Options</h2>`,6),v=a(`{
  displayHeight: number;
  displayStyle: `),_=a("DisplayStyle"),y=a(`;
}
`);function b(f,g){const t=s("Hierarchy"),o=s("Ref");return i(),r("div",null,[k,h,e(t,{extend:{name:"Node",link:"../../api/classes/node.html"}},null,8,["extend"]),m,n("pre",null,[v,e(o,{to:"../../api/interfaces/display-style"},{default:l(()=>[_]),_:1}),y])])}var q=p(u,[["render",b],["__file","line-chart-mini.html.vue"]]);export{q as default};