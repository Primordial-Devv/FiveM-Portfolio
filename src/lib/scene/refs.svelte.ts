import { getContext, setContext } from 'svelte';
import type { Mesh, Object3D } from 'three';

export type ScreenKind = 'left' | 'center' | 'right';

export class SceneRefs {
	screens = $state<Partial<Record<ScreenKind, Mesh>>>({});
	props = $state<Record<string, Object3D>>({});

	register(name: string, object: Object3D | undefined) {
		if (object) this.props[name] = object;
		else delete this.props[name];
	}
}

const KEY = Symbol('scene-refs');

export function setSceneRefs(refs = new SceneRefs()) {
	return setContext(KEY, refs);
}

export function getSceneRefs() {
	return getContext<SceneRefs>(KEY);
}
