type UUID = string

// tslint:disable-next-line
type Tag = {
  name: string
}

enum PhoneType {
  CALL = 'CELL',
  BUSINESS = 'BUSINESS',
  HOME = 'HOME'
}

interface Phone {
  type: PhoneType
  number: number
}

interface Entity {
  id: UUID
}

interface Person extends Entity {
  name: string
}

/**
 * @document
 */
interface Contact extends Person {
  tags: Tag[]
  phones: Phone[]
}
