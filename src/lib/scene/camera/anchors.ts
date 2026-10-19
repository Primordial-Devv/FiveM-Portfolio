export type CameraAnchor = {
	position: [number, number, number];
	target: [number, number, number];
	fov: number;
};

export const cameraAnchors = {
	hero: { position: [0, 1.6, 8.0], target: [0, 1.15, -0.6], fov: 30 },
	chair: { position: [-0.2, 1.2, 2.9], target: [-0.9, 0.75, 1.35], fov: 35 },
	rack: { position: [-1.2, 1.3, 1.6], target: [-3.6, 1.1, -1.2], fov: 40 },
	corner: { position: [-0.5, 1.5, 1.0], target: [-3.8, 1.3, -3.1], fov: 45 },
	plants: { position: [-1.9, 3.35, 0.4], target: [-3.2, 2.98, -1.4], fov: 32 },
	pothos: { position: [1.2, 2.6, 1.6], target: [3.4, 2.5, -0.7], fov: 40 },
	shelf: { position: [-1.6, 2.4, -6.2], target: [-2.9, 2.5, -9.3], fov: 38 },
	floorplant: { position: [-0.6, 1.4, -3.2], target: [-3.35, 1.1, -6.1], fov: 42 },
	seat: { position: [-0.3, 1.0, 2.3], target: [-0.9, 0.55, 1.45], fov: 30 },
	desk: { position: [2.6, 0.45, 2.4], target: [0.2, 0.5, 0.2], fov: 40 },
	pc: { position: [0.3, 1.4, 2.1], target: [1.5, 1.2, 0.3], fov: 36 },
	pcback: { position: [1.9, 1.35, -1.3], target: [1.5, 1.15, 0.3], fov: 36 },
	pcside: { position: [0.7, 1.25, 1.3], target: [1.5, 1.1, 0.25], fov: 30 },
	deskTop: { position: [-0.3, 1.5, 2.3], target: [-0.1, 0.85, 0.3], fov: 40 },
	mug: { position: [0.55, 1.1, 1.45], target: [0.85, 0.86, 0.6], fov: 24 },
	speaker: { position: [0.3, 1.2, 1.5], target: [1.1, 1.0, 0.0], fov: 28 },
	notebook: { position: [-0.6, 1.25, 1.7], target: [-1.1, 0.84, 0.65], fov: 26 },
	lamp: { position: [0.2, 1.5, 2.0], target: [1.05, 1.25, 0.1], fov: 32 },
	headset: { position: [-0.9, 1.4, 1.8], target: [-1.75, 1.12, 0.46], fov: 26 },
	keyboard: { position: [-0.3, 1.25, 1.75], target: [-0.3, 0.84, 0.45], fov: 30 },
	mouse: { position: [0.75, 1.25, 1.1], target: [0.37, 0.84, 0.58], fov: 22 }
} satisfies Record<string, CameraAnchor>;

export type CameraAnchorName = keyof typeof cameraAnchors;
