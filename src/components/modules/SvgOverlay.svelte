<script lang="ts">
  import { onMount } from "svelte";

  import Annotation from "./Annotation.svelte";

  export let src;
  export let minBoxSize = 10;
  export let classes = [];
  export let selected = null;
  export let annotations = [];

  let dragging = false;
  onMount(() => fetch(src)
    .then(res => res.text())
    .then(data => {
      annotations = data.split("\n").map(d => {
        const [id, x, y, w, h, p] = d.split(" ");
        return { tags: ["person"], id, x, y, w, h, p };
      });
    })
  );
  const mediaSize = { width: 0, height: 0 };
  let start = null;
  let newAnnotation = null;

  function select (a) {
    if (dragging) return;
    selected = selected === a ? null : a;
  }

  function updateAnnotation () {
    start = null;
    if (!newAnnotation) return;
    const { x, y } = newAnnotation;
    const { width, height } = mediaSize;
    const w = newAnnotation.width; const h = newAnnotation.height;
    const a = {
      id: Date.now(),
      x: (x + w / 2) / width,
      y: (y + h / 2) / height,
      w: w / width,
      h: h / height
    };
    if (a.w * width > minBoxSize || a.h * height > minBoxSize) {
      annotations.push(a);
      selected = a;
    }
    newAnnotation = null;
  }
  function deleteAnnotation () {
    const pos = annotations.indexOf(selected);
    if (pos === -1) {
      return;
    }
    annotations.splice(pos, 1);
    annotations = annotations;
    selected = annotations[pos % annotations.length];
  }
  function mousedown (e: MouseEvent) {
    if (dragging || newAnnotation) return;
    start = { x: e.offsetX, y: e.offsetY };
  }
  function mousemove (e: MouseEvent) {
    if (!start) return;
    const end = { x: e.offsetX, y: e.offsetY };
    newAnnotation = {
      x: Math.min(start.x, end.x),
      y: Math.min(start.y, end.y),
      width: Math.abs(start.x - end.x),
      height: Math.abs(start.y - end.y)
    };
  }

</script>

<div class="superpose">
  <div class="ontop" bind:clientWidth={mediaSize.width} bind:clientHeight={mediaSize.height}>
    <slot></slot>
  </div>
  <svg xmlns="http://www.w3.org/2000/svg" stroke-width=1 fill="transparent" {...mediaSize}
    on:mousedown={mousedown}
    on:mousemove={mousemove}
    on:mouseup={updateAnnotation}
  >
    {console.error(annotations)}
    {#each annotations as a (a.id)}
      <Annotation bind:data={a} bind:classes size={mediaSize} selected={selected === a} {minBoxSize}
        on:dragstart={() => { dragging = true; }} on:dragend={() => { dragging = false; }}
        on:update={() => { selected = selected; }}
        on:click={() => select(a)}
      />
    {/each}
    {#if newAnnotation}
      <rect {...newAnnotation} stroke="red" stroke-width=4/>
    {/if}
  </svg>
</div>

<style>
   .superpose {
       position: relative;
       display: inline-block;
   }

   .superpose .ontop,  .superpose .ontop * {
       display: block;
       max-width: 100%;
       height: 100%;
       width: auto;
       object-fit: contain;
   }

   .superpose svg {
       position: absolute;
       top: 0;
       left: 0;
       height:auto;
       width: auto;
   }

  </style>
