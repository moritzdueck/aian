<script lang="ts">
	import { onMount } from 'svelte';
	import { defaultRelationTypes, relationTypes, relations } from '../stores/relations';

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

	relations.subscribe(() => {
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

	function reset() {
		$relations = [];
		$relationTypes = defaultRelationTypes;
	}
</script>

<div>
	<textarea bind:value={json} class="edit-json" />
	<button class="btn ml-5" on:click={save}>Save</button>
	<button class="btn ml-5" on:click={reset}>Reset</button>
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
