<script lang="ts">
  import {media_store} from '../../stores/store.js';
 export let medium;
 let expanded = false
 // for some reason the store gets updated even when NOT USING the reactive store syntax…
 let contentAnalysis = Object.assign({}, medium.contentAnalysis)
 $: media_store.push({...medium, contentAnalysis})
</script>

<div class="media-form-container" class:expanded>
    <div class="module_topbar" on:click={() => {expanded = !!!expanded}}>
      <div class="module_title text_level1"><div class="arrow">«</div>Options</div>
    </div>
    <div class="media-form-content" class:expanded>
        <form>
            {#each Object.entries(contentAnalysis) as [key, value]}
            <div class="media-form-item">
                {#if typeof value == "boolean"}
                    <input name={key} type="checkbox" bind:checked={contentAnalysis[key]}/>
                    <label class="label_text" for={key}>{key}</label>
            {:else if typeof(value) == "number"}
                    <label class="label_text" for={key}>{key}</label>
                    <input name={key} type="number" bind:value={contentAnalysis[key]}
                    />
                {:else if key[0] !== '_'}
                    <h3 class="label_text" for={key}>{key}</h3>
                    <textarea name={key} rows=3 bind:value={contentAnalysis[key]}
                          placeholder="describe what you see in the image in a short sentence" />
            {/if}
          </div>
        {/each}
        </form>
      <slot></slot>
    </div>
</div>

<style>
 .media-form-container {
   display: flex;
   flex-direction: column;
   background-color: white;
   direction: rtl; /* ladies and gents: DA HACK */
   width: 20px;

   overflow: visible;
   margin: 10px;
   border-radius: 7px;
   transition: all 200ms;
 }
 .media-form-container.expanded {
     width: 20%;
 }
 .media-form-content {
     width: 100%;
     display:flex;
     direction: ltr;
     flex-direction: column;
     opacity: 0;
 }
 .expanded .media-form-content {
     opacity: 1;
 }
 .module_topbar {
     display: flex;
     margin: 5px;
     justify-content: flex-start;
 }
 .module_topbar .module_title {
     display: flex;
     font-size: 16px;
     transform: translateX(30px) translateY(25px) rotate(90deg);
     transition: all 200ms;
 }

 .expanded .module_topbar .module_title {
   transform: rotate(0deg);
 }

 .arrow {
     position: relative;
     float: right;
     transform: rotate(-90deg);
 }
 .expanded .arrow {
     transform: rotate(-180deg);
 }

 .media-form-item {
     padding: 5px;
 }

 label {
     padding: 5px;
     padding-left: 20px;
 }

 textarea {
     margin-left: 20px;
     height: 50px;
     border: 1px solid;
 }

 textarea::placeholder {
     color: lightgray;
 }
</style>
