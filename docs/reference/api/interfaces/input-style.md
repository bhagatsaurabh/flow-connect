# Interface: InputStyle

## Hierarchy

<Hierarchy
  :extend="{name: 'UINodeStyle', link: './ui-node-style'}"
/>

<pre>
{
  backgroundColor?: string,
  color?: string,
  fontSize?: string,
  font?: string,
  border?: string,
  type?: <Ref to="../enums/input-type">InputType</Ref>,
  align?: <Ref to="../enums/align">Align</Ref>,
  precision?: number,
  pattern?: string,
  step?: string,
  maxLength?: number,
}
</pre>

<script setup>
import Ref from '../../../../../components/api/Ref.vue';
import Hierarchy from '../../../../../components/api/hierarchy.vue';
</script>
