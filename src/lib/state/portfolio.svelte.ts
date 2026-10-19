import { getContext, setContext } from 'svelte';

export type Section = 'home' | 'projects' | 'about' | 'contact';

export const sections: Section[] = ['home', 'projects', 'about', 'contact'];

export class PortfolioState {
	section = $state<Section>('home');
	menuOpen = $state(false);
	moduleReady = $state(false);
	sceneReady = $state(false);
	assetsLoaded = $state(0);
	assetsTotal = $state(0);
	introStarted = $state(false);
	introProgress = $state(0);
	cameraProgress = $state(0);
	bookProgress = $state(0);
	storyScreens = $state(0);

	readonly isHome = $derived(this.section === 'home');
	readonly milestoneIndex = $derived(
		this.introStarted ? milestones.findLastIndex((m) => this.storyScreens >= m.at) : -1
	);
	readonly milestone = $derived(this.milestoneIndex >= 0 ? milestones[this.milestoneIndex] : null);
	readonly storyProgress = $derived(Math.min(1, this.storyScreens / STORY_SCREENS));
	readonly assetProgress = $derived(
		this.assetsTotal > 0 ? Math.min(1, this.assetsLoaded / this.assetsTotal) : 0
	);
	readonly loadProgress = $derived(
		Math.min(
			1,
			(this.moduleReady ? 0.1 : 0) + this.assetProgress * 0.55 + (this.sceneReady ? 0.35 : 0)
		)
	);
	readonly loaded = $derived(
		this.moduleReady &&
			this.sceneReady &&
			(this.assetsTotal === 0 || this.assetsLoaded >= this.assetsTotal)
	);
	readonly reveal = $derived(
		this.introStarted ? Math.min(1, Math.max(0, (this.introProgress - 0.55) / 0.35)) : 0
	);

	navigate(section: Section) {
		this.section = section;
		this.menuOpen = false;
	}

	toggleMenu() {
		this.menuOpen = !this.menuOpen;
	}

	markModuleReady() {
		this.moduleReady = true;
	}

	markSceneReady() {
		this.sceneReady = true;
	}

	setAssetProgress(loaded: number, total: number) {
		this.assetsLoaded = Math.max(this.assetsLoaded, loaded);
		this.assetsTotal = Math.max(this.assetsTotal, total);
	}

	startIntro() {
		this.introStarted = true;
	}

	setIntroProgress(value: number) {
		this.introProgress = Math.min(1, Math.max(0, value));
	}

	setStory(screens: number) {
		this.storyScreens = Math.max(0, screens);
		this.setIntroProgress(screens / STORY.intro);
		this.cameraProgress = clamp01((screens - STORY.intro) / STORY.camera);
		this.bookProgress = clamp01((screens - STORY.intro - STORY.camera) / STORY.book);
		this.section = this.milestone?.section ?? 'home';
	}
}

export const STORY = { intro: 1.6, camera: 2.2, book: 2.8 };
export const STORY_SCREENS = STORY.intro + STORY.camera + STORY.book;

export type Milestone = { id: string; label: string; section: Section; at: number };
export const milestones: Milestone[] = [
	{ id: 'atelier', label: "L'atelier", section: 'home', at: STORY.intro * 0.9 },
	{ id: 'about', label: 'Qui je suis', section: 'about', at: STORY.intro + STORY.camera * 0.9 },
	{
		id: 'skills',
		label: 'Compétences',
		section: 'about',
		at: STORY.intro + STORY.camera + STORY.book * 0.9
	}
];
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const KEY = Symbol('portfolio');

export function setPortfolioState() {
	return setContext(KEY, new PortfolioState());
}

export function getPortfolioState() {
	return getContext<PortfolioState>(KEY);
}
