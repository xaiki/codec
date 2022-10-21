<script lang="ts">
  import { element } from "svelte/internal";
  import MediaForm from "./MediaForm.svelte";

  import { local_file_store, platform_config_store } from "../../stores/store";
  export let medium;

  let src;
  if ($platform_config_store["Source of media files"].includes("local")) {
    try {
      src = URL.createObjectURL($local_file_store[medium.UAR]);
    } catch {
      src = null;
    }
  } else {
    src = medium[$platform_config_store["Title of column used for url"]];
  }

  /* We check if we have some kind of photo or a video*/
  const isPhoto = src.match(/.jpg|.png|.jpeg/i) || false;

  let elementHTML;
  let className;

  // to do: refactor to use elements instead of html strings
  if (isPhoto) {
    elementHTML = `<img src="${src}">`;
    className = "medium_img";
  } else {
    elementHTML = `<video controls muted src="${src}" type="video/mp4" />`;
    className = "medium_video";
  }
  
</script>

<div class={className} id={medium.id}>
  {@html elementHTML}
  <MediaForm {medium}></MediaForm>
</div>

<style>
  .medium_video {
    display: flex;
    width: 100%;
    height: 40vh;
    margin: 0 auto;
    overflow: hidden; /* Add this */
  }

  .medium_img {
    display: flex;
    width: 100%;
    height: 40vh;
    margin: 0 auto;
    overflow: hidden; /* Add this */
  }

  :global(.medium_video video) {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  :global(.medium_img img) {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
</style>

