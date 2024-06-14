import {
	AbstractInputSuggest,
	App, ButtonComponent,
	debounce,
	FuzzyMatch, MarkdownPostProcessor, MarkdownPostProcessorContext, MarkdownPreviewRenderer, Notice,
	Plugin,
	PluginSettingTab,
	prepareFuzzySearch,
	Setting
} from 'obsidian';
import { LANGUAGE_DATA } from "./language";
import highlightElement from 'highlight.js';
import "./styles/themes.less";
import { THEME_DATA } from "./theme";

declare module "obsidian" {
	interface MarkdownPreviewRenderer {
		postProcessors: ((el: HTMLElement, ctx: MarkdownPostProcessorContext) => void)[];
		registerPostProcessor: (postProcessor: (el: HTMLElement, ctx: MarkdownPostProcessorContext) => void, sortOrder: number) => void;
	}
}

const codeBlockPreviewStr = "function new(happy: string) {\n" +
	"   // Test\n" +
	"   const createNewFile = new File<NewDay>();\n" +
	"   const happy = new World();\n" +
	"   const file = new git();\n" +
	"}";

interface BetterCodeHighlightSettings {
	codeBlockStyleForLight: string;
	codeBlockStyleForDark: string;
}

const DEFAULT_SETTINGS: BetterCodeHighlightSettings = {
	codeBlockStyleForLight: 'github',
	codeBlockStyleForDark: 'github',
};


function notice(type: 'disabled' | 'enabled') {
	const fragment = document.createDocumentFragment();
	const containerEL = fragment.createEl('div', 'better-code-block-notice', (el) => {
		el.createEl('b', {text: 'Better Code Highlight Plugin'});
		el.createEl('p', {text: `The plugin has been ${type}. ${type === 'disabled' ? 'Code block will not be highlighted.' : 'Code block will be highlighted. If you don\'t see the changes, please reload the app.'}`});
		el.createEl('p', {text: 'Reload to apply changes', cls: 'reload-btn'});

		type === 'disabled' && (() => {
			const btn = el.createEl('div');

			new ButtonComponent(btn).setButtonText('Reload').onClick(() => {
				location.reload();
			});
		});
	});

	fragment.appendChild(containerEL);

	new Notice(fragment, type === 'disabled' ? 0 : 3000);
}


export default class BetterCodeHighlightPlugin extends Plugin {
	settings: BetterCodeHighlightSettings;

	async onload() {
		notice('enabled');
		await this.loadSettings();
		this.addSettingTab(new BetterCodeBlockSettingTab(this.app, this));
		this.initHighlightJs();

		for (const ext of LANGUAGE_DATA) {
			this.registerMarkdownCodeBlockProcessor(ext, (source, el, ctx) => {
				el.toggleClass('code-container', true);
				if (el.hasClass('.is-loaded')) {
					return;
				}

				const preElement = el.createEl('pre', {cls: ['code-wrapper']});
				const codeElement = preElement.createEl('code', {
					cls: ['language-' + ext, 'is-loaded']
				});
				codeElement.setText(source);
				highlightElement.highlightElement(codeElement);
			}, -100);
		}

		this.initStyle();
	}

	onunload() {
		notice('disabled');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	initHighlightJs() {
		const index = (MarkdownPreviewRenderer as unknown as MarkdownPreviewRenderer).postProcessors.findIndex(
			// Detect if it is the default highlighter rather than the async one from DataView plugin
			(processor: MarkdownPostProcessor) => processor.sortOrder === 100 && !processor.toString().includes('async')
		);

		if (index === -1) {
			return;
		}
		const newPostProcessor = (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
			const elArray = el.findAll('code[class*="language-"]:not(.is-loaded)');
			if (0 !== elArray.length)
				for (let i = 0; i < elArray.length; i++) {
					const el = elArray[i];

					highlightElement.highlightElement(el);
					el.addClass("is-loaded");
				}
		};

		(MarkdownPreviewRenderer as unknown as MarkdownPreviewRenderer).postProcessors.splice(index, 0, newPostProcessor);
	}

	initStyle() {
		if (document.body.hasClass('theme-light') && this.settings.codeBlockStyleForLight) {
			document.body.toggleClass('bcb-hl-' + this.settings.codeBlockStyleForLight, true);
		} else if (document.body.hasClass('theme-dark') && this.settings.codeBlockStyleForDark) {
			document.body.toggleClass('bcb-hl-' + this.settings.codeBlockStyleForDark, true);
		}

		this.app.workspace.on('css-change', () => {
			document.body.toggleClass('bcb-hl-' + this.settings.codeBlockStyleForLight, false);
			document.body.toggleClass('bcb-hl-' + this.settings.codeBlockStyleForDark, false);
			if (document.body.hasClass('theme-light')) {
				document.body.toggleClass('bcb-hl-' + this.settings.codeBlockStyleForLight, true);
			} else {
				document.body.toggleClass('bcb-hl-' + this.settings.codeBlockStyleForDark, true);
			}
		});
	}
}

class BetterCodeBlockSettingTab extends PluginSettingTab {
	plugin: BetterCodeHighlightPlugin;

	constructor(app: App, plugin: BetterCodeHighlightPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	debouncedSaveSettings = debounce((mode: 'light' | 'dark', value: string) => {
		if (mode === 'light') {
			document.body.toggleClass('bcb-hl-' + this.plugin.settings.codeBlockStyleForLight, false);
			const target = document.getElementById("code-block-preview-light");
			if (target) {
				target.toggleClass('bcb-hl-' + this.plugin.settings.codeBlockStyleForLight, false);
				target.toggleClass('bcb-hl-' + value, true);
			}

			this.plugin.settings.codeBlockStyleForLight = value;
			if (document.body.hasClass('theme-light')) {
				document.body.toggleClass('bcb-hl-' + value, true);
			}

		} else {
			document.body.toggleClass('bcb-hl-' + this.plugin.settings.codeBlockStyleForDark, false);
			const target = document.getElementById("code-block-preview-dark");
			if (target) {
				target.toggleClass('bcb-hl-' + this.plugin.settings.codeBlockStyleForDark, false);
				target.toggleClass('bcb-hl-' + value, true);
			}

			this.plugin.settings.codeBlockStyleForDark = value;
			if (document.body.hasClass('theme-dark')) {
				document.body.toggleClass('bcb-hl-' + value, true);
			}


		}
		this.plugin.saveSettings();
	}, 1000);

	display() {
		const {containerEl} = this;
		containerEl.empty();

		new Setting(containerEl).setName('Theme for light').addText((search) => {
			new ThemeSuggester(this.app, search.inputEl);
			search.setValue(this.plugin.settings.codeBlockStyleForLight).onChange((value) => {
				this.debouncedSaveSettings('light', value);
			});
		});

		const newFragmentForLight = document.createDocumentFragment();
		const codeBlockPreview = newFragmentForLight.createEl('pre', {
			cls: ['code-wrapper', 'code-block-preview', 'bcb-hl-' + this.plugin.settings.codeBlockStyleForLight],
			attr: {
				id: "code-block-preview-light"
			}
		});
		const codeBlockElement = codeBlockPreview.createEl('code', {cls: ['language-typescript']});
		codeBlockElement.setText(codeBlockPreviewStr);
		highlightElement.highlightElement(codeBlockElement);
		containerEl.appendChild(newFragmentForLight);

		new Setting(containerEl).setName('Theme for dark').addText((search) => {
			new ThemeSuggester(this.app, search.inputEl);

			search.setValue(this.plugin.settings.codeBlockStyleForDark).onChange((value) => {
				this.debouncedSaveSettings('dark', value);

			});
		});

		const newFragmentForDark = document.createDocumentFragment();
		const codeBlockPreviewDark = newFragmentForDark.createEl('pre', {
			cls: ['code-wrapper', 'code-block-preview', 'bcb-hl-' + this.plugin.settings.codeBlockStyleForDark], attr: {
				id: "code-block-preview-dark"
			}
		});
		const codeBlockElementDark = codeBlockPreviewDark.createEl('code', {cls: ['language-typescript']});
		codeBlockElementDark.setText(codeBlockPreviewStr);
		highlightElement.highlightElement(codeBlockElementDark);

		containerEl.appendChild(newFragmentForDark);
	}
}


export class ThemeSuggester extends AbstractInputSuggest<string> {
	textInputEl: HTMLInputElement;

	fuzzySearchItemsOptimized(query: string, items: string[]): FuzzyMatch<string>[] {
		const preparedSearch = prepareFuzzySearch(query);

		return items
			.map((item) => {
				const result = preparedSearch(item);
				if (result) {
					return {
						item: item,
						match: result,
						score: result.score,
					};
				}
				return null;
			})
			.sort((a, b) => (b?.score || 0) - (a?.score || 0))
			.filter(Boolean).filter((a) => {
				// @ts-ignore
				return a?.score > -5;
			}) as FuzzyMatch<string>[];
	}

	getSuggestions(inputStr: string): string[] {
		const themeData = THEME_DATA;
		const inputLower = inputStr.toLowerCase();

		const matchedThemes = this.fuzzySearchItemsOptimized(inputLower, themeData);
		return matchedThemes.map((match) => match.item);
	}

	renderSuggestion(theme: string, el: HTMLElement) {
		el.setText(theme);
	}

	selectSuggestion(theme: string) {
		this.textInputEl.value = theme;
		this.textInputEl.trigger("input");
		this.close();
	}
}
