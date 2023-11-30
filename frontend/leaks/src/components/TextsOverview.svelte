<script lang="ts">
	import { onMount } from 'svelte';
	import { relationTypes, relations } from '../stores/relations';

	let data: { title: string; id: number }[];

	async function fetchData() {
		const response = await fetch('http://127.0.0.1:5003/texts');
		data = await response.json();
	}

	let counts: { [relType: string]: { [docId: number]: number } } = {};

	relations.subscribe(update);
	relationTypes.subscribe(update);

	function update() {
		counts = {};

		$relationTypes.forEach((relType) => {
			counts[relType.key] = {};
		});

		$relations.forEach((rel) => {
			if (!counts[rel.type]) {
				counts[rel.type] = {};
			}

			counts[rel.type][rel.docId] = counts[rel.type][rel.docId]
				? counts[rel.type][rel.docId] + 1
				: 1;
		});
	}

	function getStyle(count: number) {
		if (count === 0) {
			return 'color: white; background-color: var(--red-light)';
		}

		return 'color: black';
	}

	function deleteRelation(relType: string) {
		console.log(relType);
		$relationTypes = $relationTypes.filter((relation) => relation.key !== relType);
	}

	$: relTypes = Object.keys(counts);

	onMount(fetchData);
</script>

<main>
	<div class="p-4 mt-[50px]">
		<h1 class="text-xl font-bold mb-4">Articles</h1>
		{#if data}
			<div class="overflow-x-auto w-300">
				<table class="table">
					<thead>
						<tr>
							<th>Article</th>
							{#each relTypes as relType}
								<th>
									<div class="flex items-center gap-3">
										<span>{relType}</span>
										{#if (Object.values(counts[relType]).reduce((a, b) => a + b, 0) || 0) === 0}
											<button class="btn btn-xs btn-ghost btn-danger" on:click={() => deleteRelation(relType)}>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
													stroke-width="1.5"
													stroke="currentColor"
													class="w-6 h-6"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
													/>
												</svg>
											</button>
										{/if}
									</div>
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each data as item}
							<tr>
								<td class="title"><a href="edit/{item.id}">{item.title}</a></td>
								{#each relTypes as relType}
									<td class="rel-count" style={getStyle(counts[relType][item.id] || 0)}
										>{counts[relType][item.id] || 0}</td
									>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<p>Loading...</p>
		{/if}
	</div>
</main>

<style>
	table {
		max-width: 100vw;
	}

	.title {
		min-width: 500px;
		max-width: 500px;
		color: var(--primary-color);
	}

	.rel-count {
		min-width: 70px;
		max-width: 70px;
	}
</style>
