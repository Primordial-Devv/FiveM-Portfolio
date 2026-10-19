import { describe, expect, it } from 'vitest';
import { milestones, PortfolioState, STORY } from './portfolio.svelte.js';

describe('PortfolioState', () => {
	it('starts on home with the menu closed', () => {
		const state = new PortfolioState();
		expect(state.section).toBe('home');
		expect(state.isHome).toBe(true);
		expect(state.menuOpen).toBe(false);
	});

	it('navigates and closes the menu', () => {
		const state = new PortfolioState();
		state.toggleMenu();
		expect(state.menuOpen).toBe(true);
		state.navigate('projects');
		expect(state.section).toBe('projects');
		expect(state.isHome).toBe(false);
		expect(state.menuOpen).toBe(false);
	});

	it('marks the scene as ready', () => {
		const state = new PortfolioState();
		state.markSceneReady();
		expect(state.sceneReady).toBe(true);
	});
});

describe('loading flow', () => {
	it('reports progress from module, assets and scene', () => {
		const state = new PortfolioState();
		expect(state.loadProgress).toBe(0);
		state.markModuleReady();
		expect(state.loadProgress).toBeCloseTo(0.1);
		state.setAssetProgress(2, 4);
		expect(state.loadProgress).toBeCloseTo(0.375);
		state.markSceneReady();
		expect(state.loaded).toBe(false);
		state.setAssetProgress(4, 4);
		expect(state.loadProgress).toBe(1);
		expect(state.loaded).toBe(true);
	});

	it('never lets asset counters go backwards', () => {
		const state = new PortfolioState();
		state.setAssetProgress(3, 5);
		state.setAssetProgress(1, 2);
		expect(state.assetsLoaded).toBe(3);
		expect(state.assetsTotal).toBe(5);
	});

	it('reveals the header only late in the intro', () => {
		const state = new PortfolioState();
		state.setIntroProgress(0.9);
		expect(state.reveal).toBe(0);
		state.startIntro();
		expect(state.reveal).toBe(1);
		state.setIntroProgress(0.55);
		expect(state.reveal).toBe(0);
		state.setIntroProgress(0.725);
		expect(state.reveal).toBeCloseTo(0.5);
	});
});

describe('story mapping', () => {
	it('maps scrolled screens onto the three chapters', () => {
		const state = new PortfolioState();
		state.setStory(0.8);
		expect(state.introProgress).toBeCloseTo(0.5);
		expect(state.cameraProgress).toBe(0);
		state.setStory(1.6 + 1.1);
		expect(state.introProgress).toBe(1);
		expect(state.cameraProgress).toBeCloseTo(0.5);
		expect(state.bookProgress).toBe(0);
		state.setStory(STORY.intro + STORY.camera + STORY.book);
		expect(state.cameraProgress).toBe(1);
		expect(state.bookProgress).toBe(1);
	});
});

describe('milestones', () => {
	it('switches the active section when the notebook is reached', () => {
		const state = new PortfolioState();
		state.startIntro();
		state.setStory(STORY.intro + 0.2);
		expect(state.milestone?.id).toBe('atelier');
		expect(state.section).toBe('home');
		state.setStory(milestones[1].at);
		expect(state.milestone?.id).toBe('about');
		expect(state.section).toBe('about');
		state.setStory(milestones[2].at + 0.1);
		expect(state.milestone?.id).toBe('skills');
		state.setStory(0);
		expect(state.section).toBe('home');
	});

	it('exposes no milestone before the intro starts', () => {
		const state = new PortfolioState();
		state.setStory(5);
		expect(state.milestoneIndex).toBe(-1);
	});
});
