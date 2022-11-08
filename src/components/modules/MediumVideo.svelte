<script lang="ts">
  import Tags from "svelte-tags-input";
 import MediaForm from "./MediaForm.svelte";
  import SvgOverlay from "./SvgOverlay.svelte";

  import { local_file_store, platform_config_store } from "../../stores/store";
  export let medium;

  export let src: string;

  let annotations = [];
  let classes = [];
  const selected = null;

  if ($platform_config_store["Source of media files"].includes("local")) {
    try {
      src = URL.createObjectURL($local_file_store[medium.UAR]);
    } catch {
      src = null;
    }
  } else {
    src = medium[$platform_config_store["Title of column used for url"]];
  }

  function updateTags (e: CustomEvent<{tags: string[]}>) {
    selected.tags = e.detail.tags;
    selected.tags.forEach((t: string) => { if (classes.indexOf(t) === -1) classes.push(t); });
    classes = classes;
    annotations = annotations;
  }
</script>

<div class="medium" id={medium.id}>
  <SvgOverlay classes={classes} selected={selected} annotations={annotations} src={src.replace(/\.[^.]+$/, ".txt")}>
  {#if src.includes("mp4") || src.includes("mov")}
      <video controls muted {src} type="video/mp4" style:height="100%"/>
  {:else if src.includes("png") || src.includes("jpeg") || src.includes("jpg")}
      <!-- svelte-ignore a11y-missing-attribute -->
      <img {src} style:height="100%"/>
    {/if}
  </SvgOverlay>

  <MediaForm medium={medium}>
    {#if selected}
      <div>
        <Tags tags={selected ? selected.tags : null} on:tags={updateTags}
          allowPaste={true} allowDrop={true} onlyUnique={true}
          autoCompleteKey={9} autoComplete={classes}
          placeholder="tag what you see"
        />
      </div>
    {/if}

  </MediaForm>
</div>

<style>
.medium  {
   display: flex;
   width: auto;
    height: 40vh;
    margin: 0 auto;
    overflow: hidden; /* Add this */
  }

 .medium > * {
   width: auto;
    height: 100%;
    object-fit: contain;
  }
</style>
