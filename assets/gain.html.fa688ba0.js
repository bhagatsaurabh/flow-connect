import{_ as s,r as e,o as t,c as o,a as i,b as a,e as c,d as r}from"./app.6c1464b6.js";var d="/flow-connect/images/standard-nodes/audio/gain.png";const l={},p=a("h2",{id:"standardnode-gain",tabindex:"-1"},[a("a",{class:"header-anchor",href:"#standardnode-gain","aria-hidden":"true"},"#"),c(" StandardNode: Gain")],-1),u=a("img",{class:"zoomable",alt:"Gain standard node",src:d},null,-1),m=r(`<br><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token keyword">let</span> gainNode <span class="token operator">=</span> flow<span class="token punctuation">.</span><span class="token function">createNode</span><span class="token punctuation">(</span><span class="token string">&quot;audio/gain&quot;</span><span class="token punctuation">,</span> <span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><br><h3 id="default-state" tabindex="-1"><a class="header-anchor" href="#default-state" aria-hidden="true">#</a> Default State</h3><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token punctuation">{</span>
  <span class="token literal-property property">gain</span><span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,5);function v(h,_){const n=e("Hierarchy");return t(),o("div",null,[p,u,i(n,{extend:{name:"Node",link:"../../api/classes/node.html"}},null,8,["extend"]),m])}var g=s(l,[["render",v],["__file","gain.html.vue"]]);export{g as default};
