# Interface: LabelStyle

## Hierarchy

<Hierarchy
  :extend="{name: 'UINodeStyle', link: './ui-node-style'}"
/>

<pre>
{
  color?: string,
  backgroundColor?: string,
  fontSize?: string,
  font?: string,
  align?: <Ref to="../enums/align">Align</Ref>,
  precision?: number,
  padding?: number
}
</pre>

<script setup>
import Ref from '../../../../../components/api/Ref.vue';
import Hierarchy from '../../../../../components/api/hierarchy.vue';
</script>
