<script lang="ts">
	import { page } from "$app/stores";
	import TextView from "../../../components/TextView.svelte";
	import Relations from "../../../components/Relations.svelte";

	let id = $page.params.id;
	let container;
</script>

<div class="split-view">

	<div class="text-annotation" bind:this={container}>
		<TextView textId="{id}" container="{container}"/>
	</div>

	<div class="relations">
		<Relations textId="{id}"/>
	</div>
	
</div>


<style>
	.split-view {
		display: grid;
		grid-template-columns: 1fr 550px;
	}

	.relations {
		width: 550px;
		position: fixed;
		top: 50px;
		height: calc(100vh - 50px);
		right: 0;
		background-color: var(--surface2);
		overflow: auto;
  		max-height: calc(100vh-50px);
	}

	.text-annotation {
		position: relative;
		top: 50px;
		overflow: auto;
		height: calc(100vh - 50px);
		max-height: 100vh;
    	overflow: auto;
	}

</style>