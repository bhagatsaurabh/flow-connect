import{_ as s,r as e,o as t,c as o,a as p,b as a,e as r,d as l}from"./app.6c1464b6.js";var i="/flow-connect/images/standard-nodes/math/normalize.png";const c={},d=a("h2",{id:"standardnode-normalize",tabindex:"-1"},[a("a",{class:"header-anchor",href:"#standardnode-normalize","aria-hidden":"true"},"#"),r(" StandardNode: Normalize")],-1),u=a("img",{class:"zoomable",alt:"Normalize standard node",src:i},null,-1),k=l(`<br><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token keyword">let</span> normalize <span class="token operator">=</span> flow<span class="token punctuation">.</span><span class="token function">createNode</span><span class="token punctuation">(</span><span class="token string">&quot;math/normalize&quot;</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>
  <span class="token literal-property property">normalizationType</span><span class="token operator">:</span> <span class="token string">&quot;array&quot;</span><span class="token punctuation">,</span>
  <span class="token literal-property property">state</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token literal-property property">relative</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span> <span class="token literal-property property">constant</span><span class="token operator">:</span> <span class="token number">5</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><br><h3 id="default-state" tabindex="-1"><a class="header-anchor" href="#default-state" aria-hidden="true">#</a> Default State</h3><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token punctuation">{</span>
  <span class="token literal-property property">min</span><span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span>
  <span class="token literal-property property">max</span><span class="token operator">:</span> <span class="token number">100</span><span class="token punctuation">,</span>
  <span class="token literal-property property">relative</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span>
  <span class="token literal-property property">constant</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span>
  <span class="token literal-property property">normalizationType</span><span class="token operator">:</span> <span class="token string">&quot;array&quot;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="options" tabindex="-1"><a class="header-anchor" href="#options" aria-hidden="true">#</a> Options</h2><pre>{
  normalizationType: &quot;number&quot; | &quot;array&quot;;
}
</pre>`,7);function m(v,h){const n=e("Hierarchy");return t(),o("div",null,[d,u,p(n,{extend:{name:"Node",link:"../../api/classes/node.html"}},null,8,["extend"]),k])}var y=s(c,[["render",m],["__file","normalize.html.vue"]]);export{y as default};
