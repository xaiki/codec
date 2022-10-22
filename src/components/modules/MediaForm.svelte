<script>
  export let medium;
  let expanded = false
</script>

<div class={`media-form-container ${expanded?"expanded":""}`}>
    <div class="module_topbar" on:click={() => {expanded = !!!expanded}}>
      <div class="module_title text_level1"><span>«</span>Options</div>
    </div>
    <div class="media-form-content">
      <form>
        {#each Object.entries(medium.contentAnalysis) as [contentTitle, value]}
          <div class="media-form-item">
            <label class="label_text" for={contentTitle}>{contentTitle}</label>
            {#if typeof value == "boolean"}
              <input name={contentTitle} type="checkbox" checked={value}/>
            {:else if !isNaN(value)}
              <input name={contentTitle} type="number" value={value}/>
            {:else}
              <textarea name={contentTitle} placeholder="Content Description" value={value}/>
            {/if}
          </div>
        {/each}
        <button type="submit">Submit changes</button>
      </form>
      <slot></slot>
    </div>
</div>

<style>
 .media-form-container {
   display: flex;
   flex-direction: column;
   background-color: white;
   direction: rtl;
   width: 20px;

   overflow: visible;
   margin: 10px;
   border-radius: 7px;
   transition: all 200ms;
 }
 .media-form-container.expanded {
     width: 200px;
 }
 .media-form-container > * {
     width: 200px;
 }
 .media-form-content {
     width: 200px;
     display:flex;
     flex-direction: column;
 }
 .module_topbar {
     display: flex;
     margin: 5px;
     justify-content: flex-start;
 }
 .module_topbar .module_title {
   transform: translateX(30px) translateY(25px) rotate(90deg);
   transition: all 200ms;
 }

 .module_topbar .module_title span {
   transform: rotate(180deg);
   transition: all 200ms;
 }
 .expanded .module_topbar .module_title {
   transform: rotate(0deg);
 }
 .expanded .module_topbar .module_title span {
   transform: rotate(0deg);
 }
 .module_title {
   font-size: 16px;
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

 button {
     border: 1px solid;
     border-radius: 7px;
     float: right;
     margin: 10px;
 }
</style>
