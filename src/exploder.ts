import { join, resolve } from 'path'
import {
  CodeBlockWriter,
  InterfaceDeclaration,
  JSDocableNode,
  Project,
  Type,
  TypeGuards,
  WriterFunction
} from 'ts-simple-ast'

export class InterfaceExploder {
  private project = new Project({
    tsConfigFilePath: `${resolve(__dirname, '../tsconfig.json')}`,
    addFilesFromTsConfig: false
  })

  private allInterfaces?: InterfaceDeclaration[]

  // Use this to toggle on/off pulling through the doc comments
  private includeDocComments = false

  constructor(files: string[], private readonly outPath: string) {
    this.project.addExistingSourceFiles(files)
    this.project.resolveSourceFileDependencies()
  }

  public save() {
    this.project.save()
  }

  public writeExplodedInterfaces() {
    this.getAllInterfaces()
      .filter(iface => {
        for (const doc of iface.getJsDocs()) {
          if (doc.getTags().find(tag => tag.getTagName() === 'document')) {
            return true
          }
        }
        return false
      })
      .forEach(iface => {
        const file = this.project.createSourceFile(join(this.outPath, iface.getName() + '-doc.ts'))

        const newInterface = file.addInterface({ name: iface.getName(), isExported: true })

        if (this.includeDocComments) {
          newInterface.addJsDocs(iface.getJsDocs().map(doc => doc.getInnerText()))
        }

        this.explodeInterface(iface, newInterface)
      })
  }

  public explodeInterface(oldInterface: InterfaceDeclaration, newInterface: InterfaceDeclaration) {
    for (const property of oldInterface.getProperties()) {
      newInterface.addProperty({
        ...property.getStructure(),
        docs: this.includeDocComments ? property.getStructure().docs : [],
        type: this.explodeType(property.getType())
      })
    }
  }

  /**
   * Expand out a type
   *
   * @param type The type to expand
   */
  public explodeType(type: Type): WriterFunction {
    if (type.isArray()) {
      return this.explodeArray(type.getArrayType()!)
    }

    if (type.isInterface()) {
      return this.explodeInlineInterface(type)
    }

    if (type.isUnion()) {
      return this.explodeMany(type.getUnionTypes(), '|')
    }

    if (type.isIntersection()) {
      return this.explodeMany(type.getIntersectionTypes(), '&')
    }

    return writer => writer.write(this.stringifyType(type))
  }

  /**
   * Explode an interface type
   *
   * @param type The type parameter that references an interface
   */
  public explodeInlineInterface(type: Type): WriterFunction {
    const iface = type
      .getSymbolOrThrow()
      .getDeclarations()
      .find<InterfaceDeclaration>(TypeGuards.isInterfaceDeclaration)

    if (!iface) {
      throw new Error(`Can't find interface: "${type.getText()}"`)
    }
    return writer =>
      writer.block(() => {
        for (const property of iface.getProperties()) {
          this.writeDocComments(property, writer)

          if (property.hasQuestionToken()) {
            writer.write(`${property.getName()}?: `)
          } else {
            writer.write(`${property.getName()}: `)
          }

          this.explodeType(property.getType())(writer)

          writer.write(',')
          writer.newLineIfLastNot()
        }
      })
  }

  /**
   * Explode an array
   *
   * @param type The type parameter that is inside the array
   */
  public explodeArray(type: Type): WriterFunction {
    return writer => {
      writer.write('Array<')
      this.explodeType(type)(writer)
      writer.write('>')
    }
  }

  /**
   * Join a list of types in either a union or intersection
   * @param types List of types to join together
   * @param delimiter Operator to join the types as
   */
  public explodeMany(types: Type[], delimiter: '|' | '&'): WriterFunction {
    return writer => {
      for (const type of types) {
        writer.write(delimiter + ' ')
        this.explodeType(type)(writer)
        writer.newLineIfLastNot()
      }
    }
  }

  /**
   * Given a type return the string representation
   * @param type Type object to stringify
   */
  public stringifyType(type: Type): string {
    return type.getText()
  }

  /**
   * Get all the interfaces in this project
   */
  public getAllInterfaces() {
    if (!this.allInterfaces) {
      this.findAllInterfaces()
    }

    return this.allInterfaces!
  }

  /**
   * Find all the interfaces in this project
   */
  private findAllInterfaces() {
    let all: InterfaceDeclaration[] = []

    this.project.getSourceFiles().forEach(sourceFile => {
      all = all.concat(sourceFile.getInterfaces())
    })

    this.ensureNoDuplicateInterfaces(all)

    this.allInterfaces = all
  }

  private ensureNoDuplicateInterfaces(ifaces: InterfaceDeclaration[]) {
    const sorted = ifaces.map(iface => iface.getName()).sort()

    let last: string | null = null

    for (const iface of sorted) {
      if (iface === last) {
        // console.warn(`Duplicate interface: "${iface}"`)
      }

      last = iface
    }
  }

  private writeDocComments(node: JSDocableNode, writer: CodeBlockWriter) {
    if (!this.includeDocComments) {
      return
    }
    const docs = node.getJsDocs()

    for (const doc of docs) {
      writer.writeLine(doc.getFullText())
    }
  }
}
