import { NgxMonacoEditorConfig } from "ngx-monaco-editor";

export const MonacoConfig: NgxMonacoEditorConfig = {
  baseUrl: "assets", // configure base path for monaco editor
  defaultOptions: { scrollBeyondLastLine: false }, // pass default options to be used
  onMonacoLoad: monacoOnLoad
};

export function monacoOnLoad() {
  // register Monaco languages
  monaco.languages.register({
    id: "problemframe",
    aliases: ["ProblemFrame", "problemframe", "pf"],
    extensions: [".pf"],
    mimetypes: ["text/problemframe"]
  });

  monaco.languages.setMonarchTokensProvider('problemframe', <any>{
    keywords: [
      'R', 'M','C','B','X', 'CL', 'DS', 'SE', 'AC', 'AD', 'PD','DE','D', 'P', '?'
    ],
    
    typeKeywords: [
      'instruction', 'state', 'value' ,'signal','event'
    ],

    operators: [
      '--', '~~', '~>', '->'
    ],

    //   // we include these common regular expressions
    //   // symbols: /[=><!~?:&|+\-*\/\^%]+/,
    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

    // The main tokenizer for our languages
    ignoreCase: true,
    tokenizer: {
      root: [
        // identifiers and keywords
        [/[A-Za-z_$][\w$]*/, {
          cases: {
            '@keywords': 'keyword',
            '@typeKeywords': 'keyword',
            '@default': 'identifier'
          }
        }],

        // strings
        [/"([^"\\]|\\.)*$/, 'string.invalid'],
        [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
        [/\s[RMBCXDP?][\s\n]/, 'keyword'],
        [/ event | state | value |--|~~|~>|->/, "keyword"],
      ],
      string: [
        [/[^\\"]+/, 'string'],
        [/@escapes/, 'string.escape'],
        [/\\./, 'string.escape.invalid'],
        [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
      ],
    },
  })

  monaco.editor.defineTheme('pfTheme', {
    base: 'vs',
    inherit: false,
    rules: [
      { token: 'identifier', foreground: '4B0082' },
    ],
    colors: {
      // 'editor.background':'#f4f4f4',
      'editorLineNumber.foreground': '#222222',
      'editor.lineHighlightBackground': '#f4f4f4',
    }
  });
}
