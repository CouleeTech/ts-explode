export interface Contact {
  id: string
  tags: Array<{
    name: string
  }>
  phones: Array<{
    type: PhoneType.CELL | PhoneType.BUSINESS | PhoneType.HOME
    number: number
  }>
  name: string
}
