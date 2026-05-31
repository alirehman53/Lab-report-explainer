# Tests

Dependency-free test suite. It uses Node's built-in test runner (`node:test`)
plus a tiny module hook ([helpers/alias-hooks.mjs](helpers/alias-hooks.mjs))
that transpiles TypeScript on the fly (via the project's own `typescript`
compiler) and resolves the `@/` path alias. No vitest/jest install required.

## Running

```bash
npm test          # unit tests only (fast, no OCR/PDF dependencies)
npm run test:unit # same as `npm test`
npm run test:e2e  # end-to-end: real OCR + PDF extraction on examples/
npm run test:all  # unit + e2e
```

## Layout

```
tests/
  helpers/        loader + alias/TS-transpile hook for the node test runner
  unit/           pure-function tests (parser, ocr-cleaner, validator)
  e2e/            full-pipeline tests against real files in ../examples
```

## What the suite guards

The central regression is the **"4.30 read as 430"** decimal bug. The tests pin
the contract that fixed it:

- **Faithful reads** — the parser/cleaner/validator never fabricate, rescale, or
  delete a value to make it "look" in range (`unit/parser.test.ts`,
  `unit/ocr-cleaner.test.ts`, `unit/validator.test.ts`).
- **PDF text** — digital PDFs are read via embedded text, so decimals come out
  verbatim with no OCR (`e2e/pdf-text.test.ts`).
- **Image OCR** — the image pipeline preserves decimal points end to end
  (`e2e/ocr-decimal.test.ts`). This test **skips** (does not fail) when system
  Tesseract is not installed, so CI without tesseract stays green.

## Notes

- E2E tests read fixtures from [`../examples`](../examples). Add new report
  samples there and extend the `IMAGES` / fixtures lists to grow coverage.
- The image OCR e2e test needs [Tesseract](https://github.com/tesseract-ocr/tesseract)
  on `PATH` (or at `C:\Program Files\Tesseract-OCR\tesseract.exe` on Windows).
