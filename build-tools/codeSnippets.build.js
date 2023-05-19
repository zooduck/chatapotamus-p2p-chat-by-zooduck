import * as fs from 'node:fs/promises';

const CODE_SNIPPETS_EXPORTS_DIRECTORY = 'src/code-snippets';

const filesToBuild = [
  {
    codeSnippetFile: 'code-snippets/cssVariablesColorSchemeExample.codeSnippet.css',
    jsFile: `${CODE_SNIPPETS_EXPORTS_DIRECTORY}/cssVariablesColorSchemeExample.codeSnippet.js`
  },
  {
    codeSnippetFile: 'code-snippets/productionModeHTMLExample.codeSnippet.html',
    jsFile: `${CODE_SNIPPETS_EXPORTS_DIRECTORY}/productionModeHTMLExample.codeSnippet.js`
  },
  {
    codeSnippetFile: 'code-snippets/productionModeJSExampleSimple.codeSnippet.js',
    jsFile: `${CODE_SNIPPETS_EXPORTS_DIRECTORY}/productionModeJSExampleSimple.codeSnippet.js`
  },
  {
    codeSnippetFile: 'code-snippets/productionModeJSExampleWithEvents.codeSnippet.js',
    jsFile: `${CODE_SNIPPETS_EXPORTS_DIRECTORY}/productionModeJSExampleWithEvents.codeSnippet.js`
  },
  {
    codeSnippetFile: 'code-snippets/iceServersExample.codeSnippet.js',
    jsFile: `${CODE_SNIPPETS_EXPORTS_DIRECTORY}/iceServersExample.codeSnippet.js`
  },
];

await fs.rm(CODE_SNIPPETS_EXPORTS_DIRECTORY, { recursive: true, force: true });
await fs.mkdir(CODE_SNIPPETS_EXPORTS_DIRECTORY, { recursive: true });

const buildCodeSnippets = async () => {
  for (const { codeSnippetFile, jsFile } of filesToBuild) {
    const codeSnippetFileContents = await fs.readFile(codeSnippetFile, { encoding: 'utf8' });
    await fs.writeFile(
      jsFile,
      'export default `\n' + codeSnippetFileContents.replace(/\\/g, `\\\\`).replace(/`/g, '\\`').replace(/\$/g, '\\$') + '`.trim();\n'
    );
  }
};

export { buildCodeSnippets };
