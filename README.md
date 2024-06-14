# Better Code Highlight

Last used version of highlight.js: 11.9.0

- Using highlight.js to highlight code in markdown files.
- Support [192 languages](https://github.com/highlightjs/highlight.js/blob/main/SUPPORTED_LANGUAGES.md) and 496 themes.

## All Languages

- [192 languages](./src/language.ts)
- [496 themes](./src/theme.ts)

## Usage

- Enable this plugin in settings.
- Set `light` or `dark` theme in settings.
- Reload Obsidian to take effect.

## Installation

### BRAT

[BRAT](https://github.com/TfTHacker/obsidian42-brat) (Beta Reviewer's Auto-update Tool) is a plugin that allows users to
install Obsidian plugins directly from GitHub with automatic updates.

via Commands:

1. Ensure BRAT is installed
2. Enter the command `BRAT: Plugins: Add a beta plugin for testing`
3. Enter `Quorafind/Obsidian-Better-Code-Highlight`
4. Click on Add Plugin

via Settings:

1. Ensure BRAT is installed
2. Go to *Settings > BRAT > Beta Plugin List*
3. Click on Add Beta plugin
4. Enter `Quorafind/Obsidian-Better-Code-Highlight`
5. Click on Add Plugin

### Manual

Option 1:

1. Go to [Releases](https://github.com/Quorafind/Obsidian-Better-Code-Highlight/releases)
2. Download the latest `Obsidian-Better-Code-Highlight-${version}.zip`
3. Extract its contents
4. Move the contents into /your-vault/.obsidian/plugins/obsidian-Better-Code-Highlight/
5. Go to *Settings > Community plugins*
6. Enable Legacy vault switcher

Option 2:

1. Go to [Releases](https://github.com/Quorafind/Obsidian-Better-Code-Highlight/releases)
2. Download the latest `main.js`, `styles.css` and `manifest.json`
3. Move the files into /your-vault/.obsidian/plugins/obsidian-Better-Code-Highlight/
5. Go to *Settings > Community plugins*
6. Enable Legacy vault switcher
