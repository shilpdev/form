/*
 * In-memory users API with a short delay, so the demo shows every loading state without a backend.
 * The data resets on a full page reload.
 */
import type { ItemResponse, Values } from '@shilp.dev/react-form'

export interface User {
  id: number
  name: string
  email: string
  role: string
}

const DELAY = 400

const users: User[] = [
  { id: 1, name: 'Aarav Shah', email: 'aarav@example.com', role: 'admin' },
  { id: 2, name: 'Diya Mehta', email: 'diya@example.com', role: 'editor' },
  { id: 3, name: 'Kabir Rao', email: 'kabir@example.com', role: 'viewer' },
]

let nextId = users.length + 1

function wait() {
  return new Promise((resolve) => setTimeout(resolve, DELAY))
}

function findUser(id: unknown): User {
  const user = users.find((item) => {
    return item.id === Number(id)
  })
  if (!user) {
    throw { name: 'NotFound', message: `User ${id} was not found.` }
  }
  return user
}

function toResponse(user: User): ItemResponse {
  const { name, email, role } = user
  return { values: { name, email, role }, id: user.id }
}

/** Shows server-side field errors: the API rejects an email that another user has. */
function assertUniqueEmail(values: Values, id?: number) {
  const taken = users.some((user) => {
    return user.email === values.email && user.id !== id
  })
  if (taken) {
    throw {
      name: 'ValidationError',
      message: 'The server rejected the form.',
      errors: { email: 'Another user already has this email.' },
    }
  }
}

export async function listUsers(): Promise<User[]> {
  await wait()
  return users.map((user) => {
    return { ...user }
  })
}

export async function readUser(id: unknown): Promise<ItemResponse> {
  await wait()
  return toResponse(findUser(id))
}

export async function createUser(values: Values): Promise<ItemResponse> {
  await wait()
  assertUniqueEmail(values)
  const user: User = {
    id: nextId++,
    name: String(values.name),
    email: String(values.email),
    role: String(values.role),
  }
  users.push(user)
  return toResponse(user)
}

export async function updateUser(id: unknown, values: Values): Promise<ItemResponse> {
  await wait()
  const user = findUser(id)
  assertUniqueEmail(values, user.id)
  Object.assign(user, values)
  return toResponse(user)
}

export async function deleteUser(id: unknown): Promise<ItemResponse> {
  await wait()
  const user = findUser(id)
  users.splice(users.indexOf(user), 1)
  return {}
}
