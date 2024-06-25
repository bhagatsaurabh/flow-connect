import{_ as o,r as c,o as l,c as u,b as s,a as t,w as p,e as n,d as e}from"./app.6c1464b6.js";const i={},r=s("h1",{id:"nodes",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#nodes","aria-hidden":"true"},"#"),n(" Nodes")],-1),k=s("h2",{id:"creating-a-node",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#creating-a-node","aria-hidden":"true"},"#"),n(" Creating a Node")],-1),d=n("A Node is a singular processing unit in a "),m=n("Flow"),v=n(" accepting inputs through input "),h=n("terminals"),b=n(" and producing output through output "),y=n("terminals"),g=n(" for other connected nodes/flows."),f=s("h3",{id:"using-flow-createnode",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#using-flow-createnode","aria-hidden":"true"},"#"),n(" Using Flow.createNode")],-1),_=s("br",null,null,-1),w=n("Flow.createNode"),q=e(`<div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token keyword">let</span> randomNode <span class="token operator">=</span> flow<span class="token punctuation">.</span><span class="token function">createNode</span><span class="token punctuation">(</span><span class="token string">&quot;core/empty&quot;</span><span class="token punctuation">,</span> Vector<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span><span class="token number">285</span><span class="token punctuation">,</span> <span class="token number">50</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>
  <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&quot;Random&quot;</span><span class="token punctuation">,</span>
  <span class="token literal-property property">width</span><span class="token operator">:</span> <span class="token number">120</span><span class="token punctuation">,</span>
  <span class="token literal-property property">inputs</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">{</span> <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&quot;trigger&quot;</span><span class="token punctuation">,</span> <span class="token literal-property property">dataType</span><span class="token operator">:</span> <span class="token string">&quot;event&quot;</span> <span class="token punctuation">}</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
  <span class="token literal-property property">outputs</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">{</span> <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&quot;random&quot;</span><span class="token punctuation">,</span> <span class="token literal-property property">dataType</span><span class="token operator">:</span> <span class="token string">&quot;number&quot;</span> <span class="token punctuation">}</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="extending-node-class" tabindex="-1"><a class="header-anchor" href="#extending-node-class" aria-hidden="true">#</a> Extending Node class</h3><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token keyword">class</span> <span class="token class-name">TimerNode</span> <span class="token keyword">extends</span> <span class="token class-name">Node</span> <span class="token punctuation">{</span>
  timerId <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span>

  <span class="token function">setupIO</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">addTerminals</span><span class="token punctuation">(</span><span class="token punctuation">[</span><span class="token punctuation">{</span> <span class="token literal-property property">type</span><span class="token operator">:</span> TerminalType<span class="token punctuation">.</span><span class="token constant">OUT</span><span class="token punctuation">,</span> <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&quot;trigger&quot;</span><span class="token punctuation">,</span> <span class="token literal-property property">dataType</span><span class="token operator">:</span> <span class="token string">&quot;event&quot;</span> <span class="token punctuation">}</span><span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
  <span class="token function">created</span><span class="token punctuation">(</span><span class="token parameter">options</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> <span class="token punctuation">{</span> interval <span class="token operator">=</span> <span class="token number">1000</span><span class="token punctuation">,</span> name <span class="token operator">=</span> <span class="token string">&quot;Timer&quot;</span><span class="token punctuation">,</span> width <span class="token operator">=</span> <span class="token number">100</span> <span class="token punctuation">}</span> <span class="token operator">=</span> options<span class="token punctuation">;</span>

    <span class="token keyword">this</span><span class="token punctuation">.</span>width <span class="token operator">=</span> width<span class="token punctuation">;</span>
    <span class="token keyword">this</span><span class="token punctuation">.</span>name <span class="token operator">=</span> name<span class="token punctuation">;</span>
    <span class="token keyword">this</span><span class="token punctuation">.</span>state <span class="token operator">=</span> <span class="token punctuation">{</span> interval <span class="token punctuation">}</span><span class="token punctuation">;</span>

    <span class="token keyword">this</span><span class="token punctuation">.</span>flow<span class="token punctuation">.</span><span class="token function">on</span><span class="token punctuation">(</span><span class="token string">&quot;start&quot;</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
      <span class="token keyword">this</span><span class="token punctuation">.</span>outputs<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">.</span><span class="token function">emit</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token keyword">this</span><span class="token punctuation">.</span>timerId <span class="token operator">=</span> <span class="token function">setInterval</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token keyword">this</span><span class="token punctuation">.</span>outputs<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">.</span><span class="token function">emit</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token keyword">this</span><span class="token punctuation">.</span>state<span class="token punctuation">.</span>interval<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">this</span><span class="token punctuation">.</span>flow<span class="token punctuation">.</span><span class="token function">on</span><span class="token punctuation">(</span><span class="token string">&quot;stop&quot;</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token function">clearInterval</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>timerId<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
  <span class="token function">process</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">// Register a new Node plugin by passing in the metadata and the constructor</span>
FlowConnect<span class="token punctuation">.</span><span class="token function">register</span><span class="token punctuation">(</span><span class="token punctuation">{</span> <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&quot;node&quot;</span><span class="token punctuation">,</span> <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&quot;custom/my-timer-node&quot;</span> <span class="token punctuation">}</span><span class="token punctuation">,</span> TimerNode<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">// Create the custom Node</span>
<span class="token keyword">let</span> timerNode <span class="token operator">=</span> flow<span class="token punctuation">.</span><span class="token function">createNode</span><span class="token punctuation">(</span><span class="token string">&quot;custom/my-timer-node&quot;</span><span class="token punctuation">,</span> Vector<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span><span class="token number">45</span><span class="token punctuation">,</span> <span class="token number">7</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token punctuation">{</span> <span class="token literal-property property">interval</span><span class="token operator">:</span> <span class="token number">500</span> <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="using-standardnodes" tabindex="-1"><a class="header-anchor" href="#using-standardnodes" aria-hidden="true">#</a> Using StandardNodes</h3>`,4),N=n("There are a few "),x=n("StandardNodes"),T=n(" that can be re-used instead of creating nodes from scratch:"),j=e(`<div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token keyword">let</span> numberSource <span class="token operator">=</span> flow<span class="token punctuation">.</span><span class="token function">createNode</span><span class="token punctuation">(</span><span class="token string">&quot;common/number-source&quot;</span><span class="token punctuation">,</span> Vector<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span><span class="token number">245</span><span class="token punctuation">,</span> <span class="token number">128</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>
  <span class="token literal-property property">state</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token literal-property property">value</span><span class="token operator">:</span> <span class="token number">100</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,1);function V(I,C){const a=c("Ref");return l(),u("div",null,[r,k,s("p",null,[d,t(a,{to:"/reference/api/classes/flow"},{default:p(()=>[m]),_:1}),v,t(a,{to:"/reference/api/classes/terminal"},{default:p(()=>[h]),_:1}),b,t(a,{to:"/reference/api/classes/terminal"},{default:p(()=>[y]),_:1}),g]),f,_,t(a,{to:"/reference/api/classes/flow#createnode"},{default:p(()=>[w]),_:1}),q,s("p",null,[N,t(a,{to:"/reference/standard-nodes/common/"},{default:p(()=>[x]),_:1}),T]),j])}var R=o(i,[["render",V],["__file","nodes.html.vue"]]);export{R as default};