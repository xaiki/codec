<script lang=ts>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  interface AnnotationData {
    tags: string[];
    x: number;
    y: number;
    w: number;
    h: number;
  }

  export let data: AnnotationData;
  export let size: {width: number, height: number};
  export let classes: string[] = [];
  export let selected = false;
  export let minBoxSize = 10;

  let drag = null;
  let resizing = false;
  const resize = (state: boolean) => () => { resizing = state; };

  function dragstart (e: MouseEvent) {
    drag = { x: e.offsetX, y: e.offsetY, dispatched: false };
  }
  function dragmove (e: MouseEvent) {
    if (!drag) return;
    if ((Math.abs(drag.x - e.offsetX) < minBoxSize) && (Math.abs(drag.Y - e.offsetY) < minBoxSize)) {
      return;
    }

    if (!drag.dispatched) {
      drag.dispatched = true;
      dispatch("dragstart");
    }
    updateBox([1, 1, 0, 0])(e);
  }
  function dragend () {
    if (!drag) return;
    if (!drag.dispatched) {
      dispatch("click");
    } else {
      dispatch("dragend");
    }
    drag = null;
  }

  const colors = (specifier: string) => {
    const n = specifier.length / 6 | 0; const colors = new Array(n); let i = 0;
    while (i < n) colors[i] = "#" + specifier.slice(i * 6, ++i * 6);
    return colors;
  };

  const paired = colors("a6cee31f78b4b2df8a33a02cfb9a99e31a1cfdbf6fff7f00cab2d66a3d9affff99b15928");
  let c = "red";
  let id: number;

  const { x, y, w, h } = data;
  $: if (data.tags) {
    id = classes.indexOf(data.tags[0]);
    c = id !== -1 ? paired[id % paired.length] : "red";
  }

  const box = {
    x: size.width * (x - (w / 2)),
    y: size.height * (y - (h / 2)),
    width: size.width * w,
    height: size.height * h
  };

  const circleProps = {
    stroke: c,
    r: 10
  };

  const updateBox = (trans: [number, number, number, number]) => (e: MouseEvent) => {
    if (!resizing && !drag) return;
    const w = box.width + trans[2] * e.movementX;
    const h = box.height + trans[3] * e.movementY;

    if (w < minBoxSize || h < minBoxSize) {
      return;
    }

    box.x += trans[0] * e.movementX;
    box.y += trans[1] * e.movementY;
    box.width = w;
    box.height = h;

    data.w = w / size.width;
    data.h = h / size.height;
    data.x = (box.x + w / 2) / size.width;
    data.y = (box.y + h / 2) / size.height;

    dispatch("update");
  };
</script>

<g>
  <rect class={selected ? "selected" : null}
    fill={c}
    rx="1%" ry="1%" stroke={c} {...box}
    on:mousedown|stopPropagation={dragstart}
    on:mousemove={dragmove}
    on:mouseup={dragend}
    on:mouseout={dragend}
    on:blur={dragend}
  />
  {#if data.tags && data.tags[0]}
    <!-- XXX(hack): 7 was rigourously determined by 4 consecutive dice rolls
             this is a very bad heuristic, but it's the best I could find…
             getClientWidth doesn't work for SVG elements and trying to listen on
             getBBox would only work on initial mount -->
    <rect class="label" fill={c} x={box.x + 15} y={box.y - 15} height=15 width={data.tags[0].length * 7 + 20}/>
    <text x={box.x + 20} y={box.y} stroke="black">
      {data.tags[0]}
    </text>
  {/if}
  {#each (data.tags || []).slice(1) as t, i}
    <text x={box.x + 20} y={box.y + 15 * (i + 1)} stroke="white">{t}</text>
  {/each}
  {#if selected}
    <circle cx={box.x} cy={box.y} {...circleProps}
      on:mousedown|stopPropagation={resize(true)}
      on:mousemove={updateBox([1, 1, -1, -1])}
      on:mouseup={resize(false)}
      on:mouseout={resize(false)}
      on:blur={resize(false)}
    />
    <circle cx={box.x + box.width} cy={box.y} {...circleProps}
      on:mousedown|stopPropagation={resize(true)}
      on:mousemove={updateBox([0, 1, 1, -1])}
      on:mouseup={resize(false)}
      on:mouseout={resize(false)}
      on:blur={resize(false)}
    />
    <circle cx={box.x} cy={box.y + box.height} {...circleProps}
      on:mousedown|stopPropagation={resize(true)}
      on:mousemove={updateBox([1, 0, -1, 1])}
      on:mouseup={resize(false)}
      on:mouseout={resize(false)}
      on:blur={resize(false)}
    />
    <circle cx={box.x + box.width} cy={box.y + box.height} {...circleProps}
      on:mousedown|stopPropagation={resize(true)}
      on:mousemove={updateBox([0, 0, 1, 1])}
      on:mouseup={resize(false)}
      on:mouseout={resize(false)}
      on:blur={resize(false)}
    />
  {/if}
</g>

<style>
 text {
     stroke: white;
     fill: white;
 }
 rect {
     fill-opacity: 0;
 }
 rect.selected {
     stroke-width: 2;
     fill-opacity: 0.6;
 }
 rect.label {
     fill-opacity: 1;
 }
 rect:hover {
     fill-opacity: 0.2;
 }
 circle {
     stroke-width: 3;
 }
 circle:hover {
     stroke-width: 5;
     fill-opacity: 1;
     fill: red;
 }
</style>
