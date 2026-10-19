import albedoUrl from '#lib/assets/floor-albedo.jpg';
import normalUrl from '#lib/assets/floor-normal.jpg';
import roughnessUrl from '#lib/assets/floor-roughness.jpg';
import { loadPbrSet, type PbrSet } from './texture-set.js';

const TILES_X = 6;
const TILES_Y = 4;

export function loadFloorMaps(size: number, onReady: (maps: PbrSet) => void) {
	return loadPbrSet(
		{ map: albedoUrl, normalMap: normalUrl, roughnessMap: roughnessUrl },
		size / TILES_X,
		size / TILES_Y,
		onReady
	);
}
