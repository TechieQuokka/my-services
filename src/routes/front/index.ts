import { Hono } from 'hono'
import { db } from '../../lib/db'
import { Layout } from '../../views/front/layout'
import { HomePage, ServicesPage, TrackPage, ContactPage } from '../../views/front/pages'
import type { Env } from '../../types'

const front = new Hono<{ Bindings: Env }>()

front.get('/', async (c) => {
  const { results: services } = await db.services.active(c.env)

  const content = [
    HomePage(),
    ServicesPage(services),
    TrackPage(),
    ContactPage(services)
  ]

  return c.html(Layout(content))
})

export default front
