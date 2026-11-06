'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { listUsers, type User } from '@/lib/users-api'

export default function HomePage() {
  const [users, setUsers] = useState<User[] | null>(null)

  useEffect(() => {
    listUsers().then(setUsers)
  }, [])

  let content = <p className="text-muted">Loading...</p>
  if (users) {
    content = (
      <ul className="divide-y divide-default rounded-lg border border-default bg-default">
        {users.map((user) => {
          return (
            <li key={user.id}>
              <Link href={`/users/${user.id}`} className="flex items-center gap-3 px-4 py-3">
                <span className="font-medium text-highlighted">{user.name}</span>
                <span className="text-sm text-muted">{user.email}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-highlighted">Users</h1>
        <Link
          href="/users/+"
          className="rounded-md bg-primary px-2.5 py-1.5 text-sm font-medium text-inverted"
        >
          New user
        </Link>
      </div>
      {content}
    </div>
  )
}
