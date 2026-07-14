// Ambient module declaration for `.sql` imports.
//
// Metro/Babel inline the file's text content at bundle time via the
// `inline-import` Babel plugin (see babel.config.js) and Metro's
// `sourceExts` (see metro.config.js). TypeScript has no built-in notion of
// `.sql` modules, so without this declaration `tsc` fails to resolve the
// `import m0000 from './0000_init.sql'` statement inside the generated
// drizzle-kit migrations bundle (`src/lib/db/migrations/migrations.js`),
// which is pulled into the compile graph once `src/app/_layout.tsx` imports
// it for `useMigrations`.
declare module '*.sql' {
  const content: string;
  export default content;
}
