# Interface: SerializedUINode

<pre>
{
  id: string,
  type: <Ref to="../enums/ui-type">string</Ref>,
  hitColor: <Ref to="./serialized-color">SerializedColor</Ref>,
  style: any,
  propName: string,
  input: <Ref to="./serialized-terminal">SerializedTerminal</Ref>,
  output: <Ref to="./serialized-terminal">SerializedTerminal</Ref>,
  childs: any[]
}
</pre>