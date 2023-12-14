import { getEntities, getText } from "./data/data";
import type { Entity } from "./types";


export const MODE: 'static' | 'server' = 'static'

export async function getTextById(text_id: string, mode: string): Promise<{ abstract: string; text: string; title: string } | undefined>{
    if(mode === 'static'){
        return getText(text_id)
    }

    const response = await fetch('http://127.0.0.1:5003/texts/' + text_id);
	return await response.json();
}

export async function getEntitiesById(text_id: string, mode: string): Promise<Entity[] | undefined>{
    if(mode === 'static'){
        return getEntities(text_id)
    }

    const entitiesResponse = await fetch('http://127.0.0.1:5003/entities/' + text_id);
	return await entitiesResponse.json();
}