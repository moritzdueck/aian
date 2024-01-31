<script lang="ts">
	import { mode, page } from "../stores/global";

    export let showRelationSettings: boolean = false;

    function gotoHome() {
        $page = 0;
    }

    function gotoResults() {
        $page = 1;
    }

    function gotoText() {
        $page = 2;
    }

    function gotoRelations() {
        $page = 3;
    }

    function gotoReview() {
        $page = 4;
    }

    function gotoExplorer() {
        $page = 5;
    }

</script>

<style>
    .toolbar {
        background-color: #333;
        color: #fff;
        width: 100%;
        height: 50px;
        justify-content: space-between;
        display: flex;
    }
    
    .toolbar > * {
        display: flex;
        align-items: center;
    }

    button.active {
        background-color: #555;
    }
</style>

<div class="toolbar">

    <div>
        {#if $page === 2}
            {#if $mode === 'relation'}
            <button class="btn btn-ghost"  on:click={() => $mode = 'entity'}>
                <svg class="w-6 h-6" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="23.4827" width="40.6207" height="17.0345" rx="1.31034" fill="white"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M51.4811 49.1074L51.4811 16.9312L55.4121 16.9312L55.4121 49.1074L51.4811 49.1074Z" fill="white"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M61.9642 14.9655C61.9642 16.051 61.0842 16.931 59.9987 16.931H46.8952C45.8097 16.931 44.9297 16.051 44.9297 14.9655V14.9655C44.9297 13.88 45.8097 13 46.8952 13H59.9987C61.0842 13 61.9642 13.88 61.9642 14.9655V14.9655Z" fill="white"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M61.9642 49.0344C61.9642 50.1199 61.0842 50.9999 59.9987 50.9999H46.8952C45.8097 50.9999 44.9297 50.1199 44.9297 49.0344V49.0344C44.9297 47.9488 45.8097 47.0688 46.8952 47.0688H59.9987C61.0842 47.0688 61.9642 47.9488 61.9642 49.0344V49.0344Z" fill="white"/>
                </svg>                        
            </button>
            {:else}
            <button class="btn btn-ghost"  on:click={() =>  $mode = 'relation'}>
                <svg class="w-6 h-6" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="14.0358" cy="45.9242" r="9.03581" fill="white"/>
                    <circle cx="50.2897" cy="18.0358" r="9.03581" fill="white"/>
                    <line x1="10.292" y1="48.8589" x2="53.0944" y2="16.5355" stroke="white" stroke-width="5.57767"/>
                </svg>                               
            </button>
            {/if}
        {/if}

        {#if showRelationSettings && $page === 2}
            <button class="btn btn-ghost"  on:click={() => gotoRelations()}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>                  
            </button>


            <button class="btn btn-ghost"  on:click={() => gotoReview()}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>                                               
            </button>

        {/if}

        {#if showRelationSettings && $page === 3 || $page === 4}
            <button class="btn btn-ghost"  on:click={() => gotoText()}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                  </svg>       
            </button>
        {/if}
    </div>
      
    

    <div>
        {#if $page === 0}
        <button class="btn btn-ghost" on:click={() => gotoResults()}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
              </svg>                
        </button>
        {/if}

        {#if $page === 0}
        <button class="btn btn-ghost" on:click={() => gotoExplorer()}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
            </svg>
        </button>
        {/if}

        <button class="btn btn-ghost" on:click={() => gotoHome()}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>        
        </button>
    </div>
   
</div>
