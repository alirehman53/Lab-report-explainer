/**
 * Registers the alias-resolution hooks for the Node test runner.
 * Imported via `node --import ./tests/helpers/register.mjs ...`.
 */
import { register } from 'node:module'
import { pathToFileURL } from 'node:url'

register('./alias-hooks.mjs', pathToFileURL(import.meta.dirname + '/'))
