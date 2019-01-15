import { Command, flags } from '@oclif/command'
import { InterfaceExploder } from './exploder'
import { ProjectOptions } from 'ts-simple-ast'

class Explode extends Command {
  public static description = 'describe the command here'

  // tslint:disable-next-line:no-shadowed-variable
  public static flags = {
    // add --version flag to show CLI version
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),
    out: flags.string({
      description: 'Where to put the exploded interfaces',
      char: 'o',
      required: true
    }),
    config: flags.string({
      description: 'Path to the tsconfig'
    })
  }

  public static strict = false

  public async run() {
    // tslint:disable-next-line:no-shadowed-variable
    const { flags, argv } = this.parse(Explode)

    const options: ProjectOptions = {}

    if (flags.config) {
      options.tsConfigFilePath = flags.config
    }

    const exploder = new InterfaceExploder(argv, flags.out, options)

    exploder.writeExplodedInterfaces()
    exploder.save()
  }
}

export = Explode
