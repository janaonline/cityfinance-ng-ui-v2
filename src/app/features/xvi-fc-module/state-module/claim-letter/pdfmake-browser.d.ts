/** `pdfmake/build/*` are pre-bundled browser scripts with no published type declarations
 *  (`@types/pdfmake` only types the Node.js `PdfPrinter` server API) — ambient-typed as `any` here,
 *  same convention every pdfmake+Angular integration uses. */
declare module 'pdfmake/build/pdfmake' {
  const pdfMake: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  export default pdfMake;
}

declare module 'pdfmake/build/vfs_fonts' {
  const pdfFonts: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  export default pdfFonts;
}
