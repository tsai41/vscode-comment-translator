const vscode = require('vscode');
const { parseCommentLine, buildTranslatedCommentLine } = require('./commentParser');
const { AutoTranslateController } = require('./autoTranslate');
const { normalizeProviderName, translateText } = require('./translator');
const { normalizeDisplayMode } = require('./config');

function readSettings() {
  const config = vscode.workspace.getConfiguration('mtranCommentTranslator');
  return {
    provider: normalizeProviderName(config.get('provider', 'mtran')),
    displayMode: normalizeDisplayMode(config.get('displayMode', 'hover')),
    apiUrl: config.get('apiUrl'),
    apiToken: config.get('apiToken'),
    octopusEndpoint: config.get('octopus.endpoint'),
    octopusToken: config.get('octopus.token'),
    octopusModel: config.get('octopus.model'),
    octopusSystemPrompt: config.get('octopus.systemPrompt'),
    sourceLang: config.get('sourceLang', 'auto'),
    targetLang: config.get('targetLang', 'zh-Hant'),
  };
}

async function translateCommentOnCurrentLine() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor.');
    return;
  }

  const line = editor.document.lineAt(editor.selection.active.line);
  const parsed = parseCommentLine(line.text);
  if (!parsed || !parsed.content.trim()) {
    vscode.window.showWarningMessage('Current line is not a translatable comment.');
    return;
  }

  const settings = readSettings();

  try {
    const translated = await translateText(settings, {
      from: settings.sourceLang,
      to: settings.targetLang,
      text: parsed.content,
    });

    const updatedLine = buildTranslatedCommentLine(parsed, translated);
    await editor.edit((editBuilder) => {
      editBuilder.replace(line.range, updatedLine);
    });

    vscode.window.showInformationMessage('Comment translated.');
  } catch (err) {
    vscode.window.showErrorMessage(`Translate failed: ${err.message}`);
  }
}

async function configureProvider() {
  const config = vscode.workspace.getConfiguration('mtranCommentTranslator');
  const currentProvider = normalizeProviderName(config.get('provider', 'mtran'));
  const currentDisplayMode = normalizeDisplayMode(config.get('displayMode', 'hover'));

  const pickedDisplayMode = await vscode.window.showQuickPick(
    [
      { label: 'hover', detail: 'Translate on mouse hover. Cleaner view (recommended).' },
      { label: 'codelens', detail: 'Show auto translation as CodeLens above comment line.' },
    ],
    {
      title: 'Comment Translator: Choose Display Mode',
      placeHolder: `Current: ${currentDisplayMode}`,
      ignoreFocusOut: true,
    }
  );

  if (!pickedDisplayMode) {
    return;
  }

  await config.update('displayMode', pickedDisplayMode.label, vscode.ConfigurationTarget.Global);

  const pickedProvider = await vscode.window.showQuickPick(
    [
      { label: 'mtran', detail: 'Use local MTranServer (/translate).' },
      { label: 'octopus', detail: 'Use OpenAI-compatible chat completion endpoint.' },
    ],
    {
      title: 'Comment Translator: Choose Provider',
      placeHolder: `Current: ${currentProvider}`,
      ignoreFocusOut: true,
    }
  );

  if (!pickedProvider) {
    return;
  }

  await config.update('provider', pickedProvider.label, vscode.ConfigurationTarget.Global);

  if (pickedProvider.label === 'mtran') {
    const apiUrl = await vscode.window.showInputBox({
      title: 'MTran API URL',
      prompt: 'Example: http://127.0.0.1:8989',
      value: config.get('apiUrl', 'http://127.0.0.1:8989'),
      ignoreFocusOut: true,
    });
    if (apiUrl !== undefined) {
      await config.update('apiUrl', apiUrl.trim(), vscode.ConfigurationTarget.Global);
    }

    const token = await vscode.window.showInputBox({
      title: 'MTran Token (optional)',
      prompt: 'Leave empty if token is not required.',
      value: config.get('apiToken', ''),
      password: true,
      ignoreFocusOut: true,
    });
    if (token !== undefined) {
      await config.update('apiToken', token.trim(), vscode.ConfigurationTarget.Global);
    }
  } else {
    const endpoint = await vscode.window.showInputBox({
      title: 'Octopus Endpoint',
      prompt: 'Base URL or full /v1/chat/completions endpoint.',
      value: config.get('octopus.endpoint', ''),
      ignoreFocusOut: true,
    });
    if (endpoint !== undefined) {
      await config.update('octopus.endpoint', endpoint.trim(), vscode.ConfigurationTarget.Global);
    }

    const model = await vscode.window.showInputBox({
      title: 'Octopus Model',
      prompt: 'Example: gpt-4.1-mini',
      value: config.get('octopus.model', ''),
      ignoreFocusOut: true,
    });
    if (model !== undefined) {
      await config.update('octopus.model', model.trim(), vscode.ConfigurationTarget.Global);
    }

    const token = await vscode.window.showInputBox({
      title: 'Octopus Token',
      prompt: 'Bearer token.',
      value: config.get('octopus.token', ''),
      password: true,
      ignoreFocusOut: true,
    });
    if (token !== undefined) {
      await config.update('octopus.token', token.trim(), vscode.ConfigurationTarget.Global);
    }
  }

  vscode.window.showInformationMessage(
    `Configured: provider=${pickedProvider.label}, displayMode=${pickedDisplayMode.label}`
  );
}

function activate(context) {
  const translateDisposable = vscode.commands.registerCommand(
    'mtranCommentTranslator.translateCurrentComment',
    translateCommentOnCurrentLine
  );

  const configureDisposable = vscode.commands.registerCommand(
    'mtranCommentTranslator.configureProvider',
    configureProvider
  );

  const noopDisposable = vscode.commands.registerCommand('mtranCommentTranslator.noop', () => {});

  const autoTranslateController = new AutoTranslateController(context);
  autoTranslateController.register();

  context.subscriptions.push(
    translateDisposable,
    configureDisposable,
    noopDisposable,
    autoTranslateController
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
