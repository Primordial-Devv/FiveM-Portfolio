import albedoUrl from '#lib/assets/wall-albedo.jpg';
import normalUrl from '#lib/assets/wall-normal.jpg';
import roughnessUrl from '#lib/assets/wall-roughness.jpg';
import aoUrl from '#lib/assets/wall-ao.jpg';
import { loadPbrSet, type PbrSet } from './texture-set.js';

export const WALL_TEXTURE_SIZE = { width: 7, height: 3.88 };

export function loadWallMaps(onReady: (maps: PbrSet) => void) {
	return loadPbrSet(
		{ map: albedoUrl, normalMap: normalUrl, roughnessMap: roughnessUrl, aoMap: aoUrl },
		1,
		1,
		onReady
	);
}
