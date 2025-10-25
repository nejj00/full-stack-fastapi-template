import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/mqtt-items')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_layout/mqtt-items"!</div>
}
