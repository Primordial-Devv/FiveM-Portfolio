import { RepeatWrapping, SRGBColorSpace, type Texture, TextureLoader } from 'three';

export type PbrSet = { map: Texture; normalMap: Texture; roughnessMap: Texture; aoMap?: Texture };

const loader = new TextureLoader();

function load(url: string, srgb: boolean, repeatX: number, repeatY: number) {
	return loader.loadAsync(url).then((texture) => {
		if (srgb) texture.colorSpace = SRGBColorSpace;
		texture.wrapS = RepeatWrapping;
		texture.wrapT = RepeatWrapping;
		texture.repeat.set(repeatX, repeatY);
		texture.anisotropy = 4;
		return texture;
	});
}

export function loadPbrSet(
	urls: { map: string; normalMap: string; roughnessMap: string; aoMap?: string },
	repeatX: number,
	repeatY: number,
	onReady: (set: PbrSet) => void
) {
	let cancelled = false;
	Promise.all([
		load(urls.map, true, repeatX, repeatY),
		load(urls.normalMap, false, repeatX, repeatY),
		load(urls.roughnessMap, false, repeatX, repeatY),
		urls.aoMap ? load(urls.aoMap, false, repeatX, repeatY) : Promise.resolve(undefined)
	]).then(([map, normalMap, roughnessMap, aoMap]) => {
		if (cancelled) {
			disposePbrSet({ map, normalMap, roughnessMap, aoMap });
			return;
		}
		onReady({ map, normalMap, roughnessMap, aoMap });
	});
	return () => {
		cancelled = true;
	};
}

export function clonePbrSet(set: PbrSet, repeatX: number, repeatY: number): PbrSet {
	const clone = (t: Texture) => {
		const c = t.clone();
		c.repeat.set(repeatX, repeatY);
		c.needsUpdate = true;
		return c;
	};
	return {
		map: clone(set.map),
		normalMap: clone(set.normalMap),
		roughnessMap: clone(set.roughnessMap),
		aoMap: set.aoMap ? clone(set.aoMap) : undefined
	};
}

export function disposePbrSet(set: PbrSet) {
	set.map.dispose();
	set.normalMap.dispose();
	set.roughnessMap.dispose();
	set.aoMap?.dispose();
}
