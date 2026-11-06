# Vue Form

Headless CRUD forms for Vue: read, create, update, delete an item from one schema, with your own markup.

Use it for admin panels, dashboards and any create or edit screen backed by an API.

[![npm version](https://img.shields.io/npm/v/@shilp.dev/vue-form.svg)](https://www.npmjs.com/package/@shilp.dev/vue-form)
[![downloads](https://img.shields.io/npm/dm/@shilp.dev/vue-form.svg)](https://www.npmjs.com/package/@shilp.dev/vue-form)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@shilp.dev/vue-form)](https://bundlephobia.com/package/@shilp.dev/vue-form)
[![license](https://img.shields.io/npm/l/@shilp.dev/vue-form.svg)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/shilpdev/form?style=social)](https://github.com/shilpdev/form)

Looking for React? Try [`@shilp.dev/react-form`](https://www.npmjs.com/package/@shilp.dev/react-form), which has the same API.

## Visit [Shilp Form](https://7span.com/open-source/vue-form/) for docs, guides, API and more!

## Quick Features

- Headless: you write all the markup, and nothing is styled for you
- One component for create and edit, picked from the item id
- Works with any schema library (Zod, Yup, Valibot, a plain array)
- Works with any backend: every handler returns a promise
- Options are props of `Form`; wrap it once and reuse the wrapper
- Values, initial values, dirty and touched tracking
- Server errors mapped to field errors
- Loading flags per action
- Written in TypeScript, with types included

## Install

```bash
npm install @shilp.dev/vue-form
```

Requires Vue 3.5 or newer.

See the [repository README](https://github.com/shilpdev/form#readme) for the API.

## Contributing

Issues and pull requests are welcome on [GitHub](https://github.com/shilpdev/form).
