type UUID = string

// tslint:disable-next-line
type Tag = {
  name: string
}

enum PhoneType {
  CELL,
  BUSINESS,
  HOME
}

interface Phone {
  type: PhoneType
  number: number
}

/**
 * @document
 */
interface Contact {
  id: UUID
  tags: Tag[]
  phones: Phone[]

  name: string
}
