<script lang="ts">
	import { onMount } from 'svelte';
	import { relations } from '../stores/relations';
	import { tool } from '../stores/toolbar';
	import type { Entity, Node, RelationAnnotationStatus } from '../types';
	import GenericTextView from './GenericTextView.svelte';
	import RelationEntity from './textView/RelationEntity.svelte';

	export let data: { abstract: string; text: string; title: string } | undefined = undefined;
	export let entities: Entity[] = [];
	export let textId:string = '';

	let state: RelationAnnotationStatus = {
		headEntity: undefined,
		tailEntity: undefined,
		annotationState: 'none'
	};

	let preliminaryRelation: { head: number; tail: number } | undefined = undefined;

	function onEntityAnnotation(node: Node) {
		return () => {
			if (state.headEntity === undefined) {
				state.headEntity = node;
				state.annotationState = 'tail';
			} else if (state.tailEntity === undefined) {
				state.tailEntity = node;
				state.annotationState = 'type';
				preliminaryRelation = { head: state.headEntity.id, tail: state.tailEntity.id };

				redoRelations();
			}
		};
	}

	function onAnnotationTypeSelect(type: string) {
		if (state.headEntity && state.tailEntity) {
			state.annotationState = 'head';
			$relations = [
				...$relations,
				{
					head: state.headEntity.id,
					tail: state.tailEntity.id,
					type: type,
					docId: parseInt(textId)
				}
			];
			preliminaryRelation = undefined;
			redoRelations();

			state.headEntity = undefined;
			state.tailEntity = undefined;
		}
	}

	function abortAnnotation() {
		state.annotationState = 'head';
		preliminaryRelation = undefined;
		state.headEntity = undefined;
		state.tailEntity = undefined;
		redoRelations();
	}

	function redoRelations() {
		let container = document.getElementById('annotations-container');

		if (container) {
			container.querySelectorAll('.existing-connection').forEach((el) => el.remove());
			const svg = createRelationSvg();
			for (let relation of $relations) {
				addRelationInDom(svg, relation.head, relation.tail);
			}
			if (preliminaryRelation)
				addRelationInDom(
					svg,
					preliminaryRelation.head,
					preliminaryRelation.tail,
					'var(--primary-color)'
				);
		}
	}

	function onEntityClick(node: Node) {
		return () => {
			if ($tool === 'add') {
				onEntityAnnotation(node)();
			}
		};
	}

	function createRelationSvg() {
		let scrollTop = window.scrollY - 50;

		let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('width', '100%');
		svg.setAttribute('height', '100%');
		svg.style.width = '100%';
		svg.style.height = '100%';
		svg.style.position = 'absolute';
		svg.style.top = scrollTop.toString() + 'px';
		svg.style.left = '0';
		svg.style.zIndex = $tool === 'delete' ? '1' : '-1';
		svg.classList.add('existing-connection');

		return svg;
	}

	function addRelationInDom(
		svg: SVGElement,
		entityId1: number,
		entityId2: number,
		color: string = 'var(--light-grey)'
	) {
		let node1 = document.getElementById('ent-' + entityId1);
		let node2 = document.getElementById('ent-' + entityId2);

		let container = document.getElementById('annotations-container');

		if (node1 && node2 && container) {
			let rect1 = node1.getBoundingClientRect();
			let rect2 = node2.getBoundingClientRect();

			let rect1CenterX = rect1.left + rect1.width / 2;
			let rect1CenterY = rect1.top + rect1.height / 2;

			let rect2CenterX = rect2.left + rect2.width / 2;
			let rect2CenterY = rect2.top + rect2.height / 2;

			let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

			let circle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			circle1.setAttribute('cx', rect1CenterX.toString());
			circle1.setAttribute('cy', rect1CenterY.toString());
			circle1.setAttribute('r', '10');
			circle1.setAttribute('fill', color);
			circle1.style.opacity = '0.5';

			let circle2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			circle2.setAttribute('cx', rect2CenterX.toString());
			circle2.setAttribute('cy', rect2CenterY.toString());
			circle2.setAttribute('r', '10');
			circle2.setAttribute('fill', color);
			circle2.style.opacity = '0.5';

			let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			line.setAttribute('x1', rect1CenterX.toString());
			line.setAttribute('y1', rect1CenterY.toString());
			line.setAttribute('x2', rect2CenterX.toString());
			line.setAttribute('y2', rect2CenterY.toString());
			line.setAttribute('stroke', color);
			line.setAttribute('stroke-width', '4');
			line.style.opacity = '0.5';

			g.appendChild(line);

			if ($tool === 'delete') {
				let delCircle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
				delCircle1.setAttribute('cx', rect1CenterX.toString());
				delCircle1.setAttribute('cy', rect1CenterY.toString());
				delCircle1.setAttribute('r', '10');
				delCircle1.setAttribute('fill', 'var(--red)');
				delCircle1.style.zIndex = '3';

				let delCircle2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
				delCircle2.setAttribute('cx', rect2CenterX.toString());
				delCircle2.setAttribute('cy', rect2CenterY.toString());
				delCircle2.setAttribute('r', '10');
				delCircle2.setAttribute('fill', 'var(--red)');
				delCircle2.style.zIndex = '3';

				let deleteArea = document.createElementNS('http://www.w3.org/2000/svg', 'line');
				deleteArea.setAttribute('x1', rect1CenterX.toString());
				deleteArea.setAttribute('y1', rect1CenterY.toString());
				deleteArea.setAttribute('x2', rect2CenterX.toString());
				deleteArea.setAttribute('y2', rect2CenterY.toString());
				deleteArea.setAttribute('stroke', 'var(--red)');
				deleteArea.setAttribute('stroke-width', '10');
				deleteArea.style.zIndex = '3';
				deleteArea.style.cursor = 'pointer';

				delCircle1.addEventListener('click', () => {
					$relations = $relations.filter(
						(relation) => !(relation.head === entityId1 && relation.tail === entityId2)
					);
					redoRelations();
				});

				delCircle2.addEventListener('click', () => {
					$relations = $relations.filter(
						(relation) => !(relation.head === entityId1 && relation.tail === entityId2)
					);
					redoRelations();
				});

				deleteArea.addEventListener('click', () => {
					$relations = $relations.filter(
						(relation) => !(relation.head === entityId1 && relation.tail === entityId2)
					);
					redoRelations();
				});

				g.append(deleteArea);
				g.append(delCircle1);
				g.append(delCircle2);
			}

			g.appendChild(circle1);
			g.appendChild(circle2);

			svg.appendChild(g);

			container.prepend(svg);
		}
	}

	onMount(() => {
		setTimeout(() => {
			window.addEventListener('resize', redoRelations);
			window.addEventListener('scroll', redoRelations);
			window.addEventListener('touchmove', redoRelations);

			tool.subscribe(() => {
				redoRelations();
			});
		}, 1000);
	});
</script>

<main>
	<GenericTextView {data} {entities} on:loaded={redoRelations}>
		<RelationEntity
			slot="entity"
			let:node
			let:desktop
			let:m
			{state}
			{desktop}
			entityNode={node}
			mouse={m}
			on:click={onEntityClick(node)}
			on:relationTypeSelect={(event) => onAnnotationTypeSelect(event.detail.type)}
			on:abort={abortAnnotation}
		></RelationEntity>
	</GenericTextView>
</main>
