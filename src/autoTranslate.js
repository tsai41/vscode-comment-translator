const vscode = require('vscode');
const { parseCommentLine } = require('./commentParser');
const { makeTranslationCacheKey, makeCodeLensTitle, makeHoverText } = require('./autoTranslateUtils');
const { buildProviderCacheScope, translateText } = require('./translator');
const { normalizeDisplayMode } = require('./config');

const DEFAULT_DEBOUNCE_MS = 400;

class ActiveLineTranslationCodeLensProvider {
  constructor(stateRef, onDidChangeCodeLensesEmitter) {
    this.stateRef = stateRef;
    this.onDidChangeCodeLenses = onDidChangeCodeLensesEmitter.event;
  }

  provideCodeLenses(document) {
    const state = this.stateRef();
    if (!state || state.uri !== document.uri.toString() || state.displayMode !== 'codelens') {
      return [];
    }

    const range = new vscode.Range(state.line, 0, state.line, 0);
    return [
      new vscode.CodeLens(range, {
        title: makeCodeLensTitle(state.translation),
        command: 'mtranCommentTranslator.noop',
      }),
    ];
  }
}

class CommentHoverProvider {
  constructor(translationResolver) {
    this.translationResolver = translationResolver;
  }

  async provideHover(document, position) {
    const settings = readSettings();
    if (settings.displayMode !== 'hover') {
      return null;
    }

    const line = document.lineAt(position.line);
    const parsed = parseCommentLine(line.text);
    if (!parsed || !parsed.content.trim()) {
      return null;
    }

    const translation = await this.translationResolver(settings, parsed.content);
    const md = new vscode.MarkdownString(makeHoverText(translation));
    md.isTrusted = false;

    return new vscode.Hover(md);
  }
}

function readSettings() {
  const config = vscode.workspace.getConfiguration('mtranCommentTranslator');
  return {
    provider: config.get('provider', 'mtran'),
    apiUrl: config.get('apiUrl'),
    apiToken: config.get('apiToken'),
    octopusEndpoint: config.get('octopus.endpoint'),
    octopusToken: config.get('octopus.token'),
    octopusModel: config.get('octopus.model'),
    octopusSystemPrompt: config.get('octopus.systemPrompt'),
    from: config.get('sourceLang', 'auto'),
    to: config.get('targetLang', 'zh-Hant'),
    autoEnabled: config.get('autoTranslate.enabled', true),
    debounceMs: config.get('autoTranslate.debounceMs', DEFAULT_DEBOUNCE_MS),
    displayMode: normalizeDisplayMode(config.get('displayMode', 'hover')),
  };
}

class AutoTranslateController {
  constructor(context) {
    this.context = context;
    this.timer = null;
    this.cache = new Map();
    this.pending = new Map();
    this.state = null;
    this.emitter = new vscode.EventEmitter();

    this.codeLensProvider = new ActiveLineTranslationCodeLensProvider(() => this.state, this.emitter);
    this.hoverProvider = new CommentHoverProvider((settings, text) =>
      this.resolveTranslation(settings, text)
    );
  }

  register() {
    const codeLensDisposable = vscode.languages.registerCodeLensProvider(
      { scheme: 'file' },
      this.codeLensProvider
    );

    const hoverDisposable = vscode.languages.registerHoverProvider(
      { scheme: 'file' },
      this.hoverProvider
    );

    const cursorDisposable = vscode.window.onDidChangeTextEditorSelection((event) => {
      this.scheduleForEditor(event.textEditor);
    });

    const changeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
      const editor = vscode.window.activeTextEditor;
      if (editor && editor.document === event.document) {
        this.scheduleForEditor(editor);
      }
    });

    const configDisposable = vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('mtranCommentTranslator')) {
        this.cache.clear();
        this.pending.clear();
        if (vscode.window.activeTextEditor) {
          this.scheduleForEditor(vscode.window.activeTextEditor);
        }
      }
    });

    this.context.subscriptions.push(
      codeLensDisposable,
      hoverDisposable,
      cursorDisposable,
      changeDisposable,
      configDisposable
    );

    if (vscode.window.activeTextEditor) {
      this.scheduleForEditor(vscode.window.activeTextEditor);
    }
  }

  scheduleForEditor(editor) {
    const settings = readSettings();
    if (!editor || settings.displayMode !== 'codelens' || !settings.autoEnabled) {
      this.clearState();
      return;
    }

    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.updateForEditor(editor).catch(() => {
        this.clearState();
      });
    }, settings.debounceMs);
  }

  async resolveTranslation(settings, content) {
    const cacheScope = buildProviderCacheScope(settings);
    const key = makeTranslationCacheKey(cacheScope, settings.from, settings.to, content);

    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    if (this.pending.has(key)) {
      return this.pending.get(key);
    }

    const job = translateText(settings, {
      from: settings.from,
      to: settings.to,
      text: content,
    })
      .then((translated) => {
        this.cache.set(key, translated);
        return translated;
      })
      .finally(() => {
        this.pending.delete(key);
      });

    this.pending.set(key, job);
    return job;
  }

  async updateForEditor(editor) {
    const lineNumber = editor.selection.active.line;
    const line = editor.document.lineAt(lineNumber);
    const parsed = parseCommentLine(line.text);

    if (!parsed || !parsed.content.trim()) {
      this.clearState();
      return;
    }

    const settings = readSettings();
    const translation = await this.resolveTranslation(settings, parsed.content);

    this.state = {
      uri: editor.document.uri.toString(),
      line: lineNumber,
      translation,
      displayMode: settings.displayMode,
    };

    this.emitter.fire();
  }

  clearState() {
    this.state = null;
    this.emitter.fire();
  }

  dispose() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.emitter.dispose();
  }
}

module.exports = {
  AutoTranslateController,
};
