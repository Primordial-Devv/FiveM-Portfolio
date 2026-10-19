import albedoUrl from '#lib/assets/rug-albedo.jpg';
import normalUrl from '#lib/assets/rug-normal.jpg';
import roughnessUrl from '#lib/assets/rug-roughness.jpg';
import aoUrl from '#lib/assets/rug-ao.jpg';
import { loadPbrSet, type PbrSet } from './texture-set.js';

export function loadRugMaps(repeatX: number, repeatY: number, onReady: (maps: PbrSet) => void) {
	return loadPbrSet(
		{ map: albedoUrl, normalMap: normalUrl, roughnessMap: roughnessUrl, aoMap: aoUrl },
		repeatX,
		repeatY,
		onReady
	);
}
