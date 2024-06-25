import{_ as s,r as e,o as t,c as o,a as p,b as a,e as c,d as i}from"./app.6c1464b6.js";var r="/flow-connect/images/standard-nodes/net/api.png";const l={},d=a("h2",{id:"standardnode-api",tabindex:"-1"},[a("a",{class:"header-anchor",href:"#standardnode-api","aria-hidden":"true"},"#"),c(" StandardNode: API")],-1),u=a("img",{class:"zoomable",alt:"API standard node",src:r},null,-1),v=i(`<br><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token keyword">let</span> api <span class="token operator">=</span> flow<span class="token punctuation">.</span><span class="token function">createNode</span><span class="token punctuation">(</span><span class="token string">&quot;net/api&quot;</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>
  <span class="token literal-property property">state</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">src</span><span class="token operator">:</span> <span class="token string">&quot;https://public.example.com/data&quot;</span><span class="token punctuation">,</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><br><h3 id="default-state" tabindex="-1"><a class="header-anchor" href="#default-state" aria-hidden="true">#</a> Default State</h3><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token punctuation">{</span>
  <span class="token literal-property property">src</span><span class="token operator">:</span> <span class="token string">&quot;&quot;</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,5);function k(m,h){const n=e("Hierarchy");return t(),o("div",null,[d,u,p(n,{extend:{name:"Node",link:"../../api/classes/node.html"}},null,8,["extend"]),v])}var b=s(l,[["render",k],["__file","api.html.vue"]]);export{b as default};