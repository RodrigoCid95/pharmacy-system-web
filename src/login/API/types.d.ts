export type User = {
  id: string
  name: string
  userName: string
  disabled: boolean
}
export interface DataUser extends User {
  hashPassword: string
}
export type Auth = {
  enter: (userName: string, _password: string, isAdmin: boolean) => Promise<void>
}