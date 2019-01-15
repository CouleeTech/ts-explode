import { expect, test } from '@oclif/test'

import cmd = require('../src')
import { tmpdir } from 'os'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('ts-explode', () => {
  const dir = tmpdir()

  test
    .stdout()
    .do(() => cmd.run(['--out', dir, 'test/testInterfaces/']))
    .it('generates correct file', ctx => {
      expect(readFileSync(join(dir, 'Contact-doc.ts'), 'utf8')).to.equal(
        readFileSync('test/fixtures/Contact-doc.ts', 'utf8')
      )
    })
})
