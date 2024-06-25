import{_ as e,r as n,o as t,c as o,a as r,b as a,e as i,d as l}from"./app.6c1464b6.js";var c="/flow-connect/images/standard-nodes/audio/biquad-filter.png";const p={},d=a("h2",{id:"standardnode-biquadfilter",tabindex:"-1"},[a("a",{class:"header-anchor",href:"#standardnode-biquadfilter","aria-hidden":"true"},"#"),i(" StandardNode: BiquadFilter")],-1),u=a("img",{class:"zoomable",alt:"BiquadFilter standard node",src:c},null,-1),k=l(`<br><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token keyword">let</span> biquadFilter <span class="token operator">=</span> flow<span class="token punctuation">.</span><span class="token function">createNode</span><span class="token punctuation">(</span><span class="token string">&quot;audio/biquad-filter&quot;</span><span class="token punctuation">,</span> <span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><br><h3 id="default-state" tabindex="-1"><a class="header-anchor" href="#default-state" aria-hidden="true">#</a> Default State</h3><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token punctuation">{</span> <span class="token literal-property property">filterType</span><span class="token operator">:</span> <span class="token string">&#39;lowpass&#39;</span><span class="token punctuation">,</span> <span class="token literal-property property">bypass</span><span class="token operator">:</span> <span class="token boolean">false</span> <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div>`,5);function f(h,m){const s=n("Hierarchy");return t(),o("div",null,[d,u,r(s,{extend:{name:"Node",link:"../../api/classes/node.html"}},null,8,["extend"]),k])}var b=e(p,[["render",f],["__file","biquad-filter.html.vue"]]);export{b as default};
