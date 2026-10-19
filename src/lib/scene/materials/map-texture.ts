import { SRGBColorSpace, type Texture, TextureLoader } from 'three';
import mapUrl from '#lib/assets/gta-map.jpg';

export function loadMapTexture(onReady: (texture: Texture) => void) {
	new TextureLoader().load(mapUrl, (texture) => {
		texture.colorSpace = SRGBColorSpace;
		texture.anisotropy = 8;
		onReady(texture);
	});
}
