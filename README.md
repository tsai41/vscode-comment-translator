# Comment Translator (VS Code)

Translate code comments with multiple providers and display modes.

## Providers

- `mtran`: local MTranServer `/translate`
- `octopus`: OpenAI-compatible `/v1/chat/completions`

## Display Modes

- `hover` (default): translate on mouse hover
- `codelens`: auto translate and show above comment line

## Commands

- `Comment Translator: Translate Current Comment`
- `Comment Translator: Configure Provider`

## Configure in UI

Run `Comment Translator: Configure Provider` and fill:

- display mode (`hover` / `codelens`)
- provider (`mtran` / `octopus`)
- endpoint / model / token fields

## Settings Prefix

All settings use `mtranCommentTranslator.*`.
