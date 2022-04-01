# Interface: SerializedGroup

<pre>
{
  position: <Ref to="./serialized-vector">SerializedVector</Ref>,
  width: number,
  height: number,
  name: string,
  style: <Ref to="./group-style">GroupStyle</Ref>,
  id: string,
  hitColor: <Ref to="./serialized-color">SerializedColor</Ref>,
  nodes: string[],
  nodeDeltas: <Ref to="./serialized-vector">SerializedVector</Ref>[]
}
</pre>

<script setup>
import Ref from '../../../../../components/api/Ref.vue';
</script>
