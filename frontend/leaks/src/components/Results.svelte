<script lang="ts">
	import { onMount } from 'svelte';
	import { relationTypes, relations } from '../stores/relations';

	let json: string = '';

	onMount(() => {
		json = JSON.stringify(
			{
				relations: $relations,
				relationTypes: $relationTypes
			},
			null,
			2
		);
	});

	function save() {
		const data = JSON.parse(json);
		$relations = data.relations;
		$relationTypes = data.relationTypes;
	}
</script>

<div>
	<textarea bind:value={json} class="edit-json" />
	<button class="btn ml-5" on:click={save}>Save</button>
</div>

<style>
	.edit-json {
		margin: 20px;
		width: calc(100% - 40px);
		height: calc(100vh - 180px);
		background-color: #2b3440;
		color: white;
		font-family: monospace;
		border-radius: 5px;
		padding: 10px;
	}
</style>
