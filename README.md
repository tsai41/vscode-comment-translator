# Comment Translator (VS Code)

Translate code comments with multiple providers and display modes.

This extension is **not published to the VS Code Marketplace**. It depends on a
self-hosted translation backend (MTranServer) or an OpenAI-compatible endpoint
you provide. Build the VSIX yourself or grab a prebuilt one from
[Releases](https://github.com/tsai41/vscode-comment-translator/releases).

## Install

### Option A — prebuilt VSIX

1. Download `vscode-comment-translator-<version>.vsix` from
   [Releases](https://github.com/tsai41/vscode-comment-translator/releases).
2. Install:
   ```sh
   code --install-extension vscode-comment-translator-<version>.vsix
   ```
   Or in VS Code: `Extensions` panel → `…` menu → `Install from VSIX…`.

### Option B — build from source

```sh
git clone https://github.com/tsai41/vscode-comment-translator.git
cd vscode-comment-translator
npx @vscode/vsce package
code --install-extension vscode-comment-translator-*.vsix
```

## Providers

You must run / have access to one of:

- **`mtran`** — self-hosted [MTranServer](https://github.com/xxnuo/MTranServer)
  exposing `POST /translate`. Default URL `http://127.0.0.1:8989`.
- **`octopus`** — any OpenAI-compatible chat completions endpoint
  (`/v1/chat/completions`). Works with OpenAI, Ollama, LM Studio, OpenRouter,
  vLLM, etc.

## Display Modes

- `hover` (default): translate on mouse hover
- `codelens`: auto-translate and show above the comment line

## Commands

- `Comment Translator: Translate Current Comment`
- `Comment Translator: Configure Provider`

## Configure

Run `Comment Translator: Configure Provider` from the command palette and fill
in the prompts, or edit `settings.json` directly. All settings live under the
`mtranCommentTranslator.*` namespace.

### Example — MTranServer

```jsonc
{
  "mtranCommentTranslator.provider": "mtran",
  "mtranCommentTranslator.displayMode": "hover",
  "mtranCommentTranslator.apiUrl": "http://127.0.0.1:8989",
  "mtranCommentTranslator.targetLang": "zh-Hant"
}
```

### Example — OpenAI-compatible (Octopus)

```jsonc
{
  "mtranCommentTranslator.provider": "octopus",
  "mtranCommentTranslator.displayMode": "codelens",
  "mtranCommentTranslator.octopus.endpoint": "https://api.openai.com/v1/chat/completions",
  "mtranCommentTranslator.octopus.model": "gpt-4o-mini",
  "mtranCommentTranslator.octopus.token": "sk-...",
  "mtranCommentTranslator.targetLang": "zh-Hant"
}
```

## Privacy

When using the `octopus` provider, the comment text under your cursor is sent
to whichever endpoint you configure. Use a local model (Ollama, LM Studio) if
this matters for your codebase.

## Development

```sh
npm test                       # run unit tests (node --test)
npx @vscode/vsce package       # build VSIX
```

Press `F5` in VS Code to launch an Extension Development Host for live
debugging.

## License

[MIT](LICENSE)
