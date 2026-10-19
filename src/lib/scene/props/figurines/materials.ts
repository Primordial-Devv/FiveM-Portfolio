import { Color, MeshPhysicalMaterial, MeshStandardMaterial } from 'three';
import {
	createLeatherTexture,
	createMarbleTexture,
	createStoneTexture,
	createWoodGrainTexture
} from '../../materials/figurine-textures.js';

export const figurineMaterials = {
	walnut: new MeshStandardMaterial({ color: '#ffffff', roughness: 0.55, metalness: 0 }),
	beech: new MeshStandardMaterial({ color: '#ffffff', roughness: 0.6, metalness: 0 }),
	brass: new MeshStandardMaterial({
		color: '#d2a84e',
		roughness: 0.22,
		metalness: 1,
		envMapIntensity: 1.4
	}),
	chrome: new MeshStandardMaterial({
		color: '#dfe3e8',
		roughness: 0.18,
		metalness: 1,
		envMapIntensity: 1.2
	}),
	marble: new MeshPhysicalMaterial({
		color: '#ffffff',
		roughness: 0.16,
		metalness: 0,
		clearcoat: 0.6,
		clearcoatRoughness: 0.2
	}),
	ceramic: new MeshStandardMaterial({ color: '#1c1d21', roughness: 0.82, metalness: 0 }),
	leather: new MeshStandardMaterial({
		color: '#ffffff',
		roughness: 0.78,
		metalness: 0,
		bumpScale: 0.3
	}),
	stone: new MeshStandardMaterial({ color: '#ffffff', roughness: 0.9, metalness: 0 }),
	stoneDark: new MeshStandardMaterial({ color: '#ffffff', roughness: 0.88, metalness: 0 }),
	glass: new MeshPhysicalMaterial({
		color: '#101418',
		roughness: 0.05,
		metalness: 0,
		clearcoat: 1,
		clearcoatRoughness: 0.05
	}),
	black: new MeshStandardMaterial({ color: '#111216', roughness: 0.55, metalness: 0.1 })
};

let ready = false;
export function ensureFigurineTextures() {
	if (ready) return;
	ready = true;
	figurineMaterials.walnut.map = createWoodGrainTexture([112, 74, 46], [58, 34, 20], 3);
	figurineMaterials.beech.map = createWoodGrainTexture([214, 178, 128], [160, 118, 72], 8);
	figurineMaterials.marble.map = createMarbleTexture();
	const leather = createLeatherTexture();
	figurineMaterials.leather.map = leather;
	figurineMaterials.leather.bumpMap = leather;
	figurineMaterials.stone.map = createStoneTexture([128, 124, 118], 7);
	figurineMaterials.stoneDark.map = createStoneTexture([86, 84, 82], 11);
	for (const material of Object.values(figurineMaterials)) material.needsUpdate = true;
	figurineMaterials.brass.color = new Color('#d2a84e');
}
