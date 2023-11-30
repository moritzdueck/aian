<script>
    import "../app.css";
	import Toolbar from "../components/Toolbar.svelte";
    import { page } from '$app/stores';  
    
	export const prerender = true;

    $: showTools = $page.url.pathname.startsWith("/edit");
            
</script>

<div class="toolbar"><Toolbar showTools={showTools}/></div>

<slot />

<style>
    .toolbar {
		position: fixed;
		width: 100%;
		z-index: 3;
		top: 0;
		height: 50px;
	}
</style>

