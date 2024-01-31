import { writable } from "svelte/store";
import type { Entity, Node } from "../types";

export let entities = [] as Entity[];
export let entityChange = writable(0);


export function setInitial(initialEntities: Entity[]) {
    console.log("setting initial entities");
    
    initialEntities.sort((a, b) => (a.score < b.score ? 1 : -1));
    initialEntities.sort((a, b) => (a.start > b.start ? 1 : -1));

    // iterate over all entities, take the start position and the end position and only add it if the next start position is bigger than the end position
    let activeEntities = initialEntities
        .filter((entity, index) => !entities[index + 1] || entities[index + 1].start > entity.end)
        .map((entity) => entity.id);

    initialEntities.forEach((entity) => {
        entity.active = activeEntities.includes(entity.id);
    });

    entities = initialEntities;
}

export function getCandidates(entityId: number): Entity[] {    
    //find the entity that was updated
    let updatedEntity = entities.find((e) => e.id === entityId);

    if (!updatedEntity) {
        return [];
    }

    let overlappingEntities = [...entities.filter((e) => intervalsIntersect(e, updatedEntity!))];

    overlappingEntities.sort((a, b) => (a.cui > b.cui ? 1 : -1));
    overlappingEntities.sort((a, b) => (a.score > b.score ? 1 : -1));
    return overlappingEntities
}


export function updateEntity(previousEntity: Node, newEntity: Entity) {    
    entities.find((e) => e.id === previousEntity.id)!.active = false;
    entities.find((e) => e.id === newEntity.id)!.active = true;
    entityChange.update((n) => n + 1);
}

function intervalsIntersect(a: Entity, b: Entity) {
    return a.start < b.end && b.start < a.end;
}

export function readEntities() {
    return entities.filter((entity) => entity.active);
}