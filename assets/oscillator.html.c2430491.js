import{_ as n,r as e,o as t,c as o,a as r,b as a,e as l,d as c}from"./app.6c1464b6.js";var p="/flow-connect/images/standard-nodes/audio/oscillator.png";const i={},d=a("h2",{id:"standardnode-oscillator",tabindex:"-1"},[a("a",{class:"header-anchor",href:"#standardnode-oscillator","aria-hidden":"true"},"#"),l(" StandardNode: Oscillator")],-1),u=a("img",{class:"zoomable",alt:"Oscillator standard node",src:p},null,-1),v=c(`<br><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token keyword">let</span> oscillator <span class="token operator">=</span> flow<span class="token punctuation">.</span><span class="token function">createNode</span><span class="token punctuation">(</span><span class="token string">&quot;audio/oscillator&quot;</span><span class="token punctuation">,</span> <span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><br><h3 id="default-state" tabindex="-1"><a class="header-anchor" href="#default-state" aria-hidden="true">#</a> Default State</h3><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token punctuation">{</span>
  <span class="token literal-property property">frequency</span><span class="token operator">:</span> <span class="token number">440</span><span class="token punctuation">,</span>
  <span class="token literal-property property">detune</span><span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span>
  <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;sine&#39;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,5);function k(m,h){const s=e("Hierarchy");return t(),o("div",null,[d,u,r(s,{extend:{name:"Node",link:"../../api/classes/node.html"}},null,8,["extend"]),v])}var b=n(i,[["render",k],["__file","oscillator.html.vue"]]);export{b as default};
