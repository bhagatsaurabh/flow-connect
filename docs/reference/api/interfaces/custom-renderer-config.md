# Interface: CustomRendererConfig

<pre>
{
  auto?: boolean,
  clear?: boolean,
  canvasType?: <Ref to="../enums/canvas-type">CanvasType</Ref>,
  renderer?: (
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    width: number,
    height: number
  ) => boolean,
}
</pre>
