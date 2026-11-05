import { z } from 'zod'

export const ROLES = ['admin', 'editor', 'viewer']

export const userSchema = z.object({
  name: z.string().min(2, 'Name needs at least 2 characters.'),
  email: z.email('Enter a valid email.'),
  role: z.enum(ROLES, 'Pick a role.'),
})
