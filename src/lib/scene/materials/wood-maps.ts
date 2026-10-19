import albedoUrl from '#lib/assets/wood-albedo.jpg';
import normalUrl from '#lib/assets/wood-normal.jpg';
import roughnessUrl from '#lib/assets/wood-roughness.jpg';
import aoUrl from '#lib/assets/wood-ao.jpg';
import { loadPbrSet, type PbrSet } from './texture-set.js';

export const WOOD_PLANKS = 7;

export function loadWoodMaps(onReady: (maps: PbrSet) => void) {
	return loadPbrSet(
		{ map: albedoUrl, normalMap: normalUrl, roughnessMap: roughnessUrl, aoMap: aoUrl },
		1,
		1,
		(set) => {
			for (const t of [set.map, set.normalMap, set.roughnessMap, set.aoMap]) {
				if (!t) continue;
				t.center.set(0.5, 0.5);
				t.rotation = Math.PI / 2;
				t.needsUpdate = true;
			}
			onReady(set);
		}
	);
}
