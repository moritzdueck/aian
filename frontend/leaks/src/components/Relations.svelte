<script lang="ts">
	import { colorMap, relationTypes, relations } from '../stores/relations';

	export let textId: string = '1';

	function addRelation() {
		$relationTypes = [...$relationTypes, { name: relationName, key: relationName }];
		relationName = '';
	}

	function checkEnter(event: KeyboardEvent) {
		if (event.charCode === 13) addRelation();
	}

	let countsTotal: { [key: string]: number } = {};
    let counts: { [key: string]: number } = {};

	relations.subscribe((rels) => {
		counts = {};
        countsTotal = {};
		rels.filter(rel => rel.docId === Number.parseInt(textId)).forEach((rel) => {
			counts[rel.type] = counts[rel.type] ? counts[rel.type] + 1 : 1;
		});

        rels.forEach((rel) => {
            countsTotal[rel.type] = countsTotal[rel.type] ? countsTotal[rel.type] + 1 : 1;
        });
	});

	let relationName: string = '';
</script>

<main>
	<div class="p-5">
		<h1 class="text-xl font-bold mb-4">Relations</h1>

		<table class="table table-xs">
			<thead>
				<tr>
					<th>Name</th>
					<th>Open Document</th>
					<th>Total</th>
					<th>Action</th>
				</tr>
			</thead>
			<tbody>
				{#each $relationTypes as relationType}
					<tr>
						<td>{relationType.name}</td>
						<td>{counts[relationType.key] || 0}</td>
						<td>{countsTotal[relationType.key] || 0}</td>
						<td>
                            {#if (countsTotal[relationType.key] || 0) === 0}
                            <button
                            class="btn btn-xs btn-danger"
                            on:click={() =>
                                ($relationTypes = $relationTypes.filter(
                                    (relation) => relation.key !== relationType.key
                                ))}>Delete</button>
                            {/if}
							
						</td>
					</tr>
				{/each}
			</tbody>
		</table>

		<div class="flex items-baseline mt-5 pt-4 gap-2">
			<p class="mb-2">Add new relation type</p>
			<input
				type="text"
				placeholder="Name"
				bind:value={relationName}
				on:keypress={checkEnter}
				class="input input-sm w-full max-w-xs"
			/>
			<button class="btn btn-sm btn-primary" on:click={() => addRelation()}>Add</button>
		</div>
	</div>
</main>

<style>

	.color-indicator {
		display: inline-block;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		opacity: 0.5;
		
	}
</style>
