# Interface: DataPersistenceProvider

A user provided function that abstracts the storage of external files being used by any of the nodes.

For e.g. a <Ref to="/reference/standard-nodes/audio/source">Source</Ref> StandardNode from <Ref to="/reference/standard-nodes/audio">Audio</Ref> package can hold a reference of user provided audio file, since this file cannot be serialized while calling <Ref to="/reference/api/classes/flow-connect#tojson">FlowConnect<em>.toJson()</em></Ref> in its basic form, an optional argument can be passed which handles where and how the file is actually stored.

While serializing a flow using <Ref to="/reference/api/classes/flow-connect#tojson">FlowConnect<em>.toJson()</em></Ref>, everytime a file is encountered, this function will be called with a unique id and a reference to the actual file.

The implementation of this function is up to the developer, whether the files needs to be stored in an IndexedDB or stored temporarily as a Blob reference or archiving in a file...

When de-serializing using <Ref to="/reference/api/classes/flow-connect#fromjson">FlowConnect<em>.fromJson()</em></Ref>, the same unique ids will be passed to a <Ref to="/reference/api/interfaces/data-fetch-provider">DataFetchProvider</Ref>, which is another developer implemented function that returns a Blob back whenever FlowConnect encounters a stored file in serialized flow JSON.

<pre>
<Function /> (id: string, ref: Blob) => Promise&lt;void&gt;
</pre>
