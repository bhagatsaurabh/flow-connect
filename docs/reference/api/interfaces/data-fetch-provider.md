# Interface: DataFetchProvider

A user provided function that abstracts the retrieval of external files that was being used by any of the nodes before serializing the Flow to JSON.

For e.g. a <Ref to="/reference/standard-nodes/audio/source">Source</Ref> StandardNode from <Ref to="/reference/standard-nodes/audio">Audio</Ref> package can hold a reference of user provided audio file, since this file cannot be serialized while calling <Ref to="/reference/api/classes/flow-connect#tojson">FlowConnect<em>.toJson()</em></Ref> in its basic form, an optional argument can be passed which handles where and how the file is actually stored.

While serializing a flow using <Ref to="/reference/api/classes/flow-connect#tojson">FlowConnect<em>.toJson()</em></Ref>, everytime a file is encountered, <Ref to="/reference/api/interfaces/data-persistence-provider">DataPersistenceProvider</Ref> (a developer implemented function) will handle persistence of the files where each stored file will have a unique id.

When de-serializing using <Ref to="/reference/api/classes/flow-connect#fromjson">FlowConnect<em>.fromJson()</em></Ref>, FlowConnect will invoke this function whenever a stored file id and its name is encountered in serialized flow JSON, the same unique id will be passed as the first argument, and this function should return a Blob back corresponding to the file that was stored previously.

<pre>
<Function /> (id: string) => Promise&lt;Blob&gt;
</pre>
