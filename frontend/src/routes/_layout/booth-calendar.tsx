import { Container, Heading, List, Spinner, Text } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import { PhoneBoothsService } from "@/client"
import { useQuery } from "@tanstack/react-query"
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
// import { dummyEvents, DUMMY_EVENTS_6_TO_8 } from "@/data/dummyEvents"
import PhoneBoothTreeFilter from "@/components/Common/PhoneBoothFilterTree"


// 🎨 A simple set of colors to cycle through for events
const EVENT_COLORS = [
  "#3182ce", // blue
  "#38a169", // green
  "#d69e2e", // yellow
  "#dd6b20", // orange
  "#805ad5", // purple
  "#e53e3e", // red
  "#319795", // teal
  "#718096", // gray
]

function getBusyPhoneBoothsQuery() {
  return {
    queryKey: ["busyPhoneBooths"],
    queryFn: () => PhoneBoothsService.readBusyPhoneBooths({ skip: 0, limit: 100 }),
    refetchInterval: 10000, // Refetch every 10 seconds
  }
}

export const Route = createFileRoute("/_layout/booth-calendar")({
  component: BoothCalendar,
})

function BusyPhoneBoothsList() {
  const { data, isLoading, isError, error } = useQuery(getBusyPhoneBoothsQuery())

  if (isLoading) return <Spinner />
  if (isError) return <Text color="red.500">Error: {error.message}</Text>

  const booths = data || []

  if (booths.length === 0) {
    return <Text>No busy phone booths right now.</Text>
  }

  return (
    <List.Root>
      {booths.map((booth: any) => (
        <List.Item
          key={booth.id}
          border="1px solid"
          borderColor="gray.200"
          p={2}
          borderRadius="md"
        >
          <Text fontWeight="bold">{booth.name || `Booth #${booth.id}`}</Text>
          {booth.location && <Text fontSize="sm">Location: {booth.location}</Text>}
        </List.Item>
      ))}
    </List.Root>
  )
}

function CalendarView() {
  const { data, isLoading, isError, error } = useQuery(getBusyPhoneBoothsQuery())

  if (isLoading) {
    return (
      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <Spinner />
      </div>
    )
  }

  if (isError) {
    return (
      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <Text color="red.500">Error loading calendar: {error.message}</Text>
      </div>
    )
  }

  const booths = data || []
  const now = new Date().toISOString()

  // Helper: deterministic color picker based on booth ID
  const getColorForBooth = (boothId: string) => {
    let hash = 0
    for (let i = 0; i < boothId.length; i++) {
      hash = boothId.charCodeAt(i) + ((hash << 5) - hash)
    }
    const colorIndex = Math.abs(hash) % EVENT_COLORS.length
    return EVENT_COLORS[colorIndex]
  }

  // Transform booth data → FullCalendar event format
  const events = booths.map((booth: any) => ({
    id: booth.id,
    title: booth.name || 'Unknown Booth',
    start: booth.updated_at,
    end: now,
    color: getColorForBooth(booth.id), // 👈 unique color per booth
  }))

  return (
    <div style={{ marginTop: '40px' }}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        initialView='dayGridMonth'
        editable={false}
        selectable={false}
        selectMirror={false}
        dayMaxEvents={true}
        weekends={true}
        // events={[...dummyEvents, ...DUMMY_EVENTS_6_TO_8]} // test events
        events={events} // 👈 dynamically injected events with colors
        eventDisplay="block"
        height="auto"
      />
    </div>
  )
}

function BoothCalendar() {
  return (
    <Container maxW="full" pt={12}>
      <Heading size="lg" mb={4}>
        Busy Phone Booths
      </Heading>
      <PhoneBoothTreeFilter />
      <BusyPhoneBoothsList />
      <CalendarView />
    </Container>
  )
}
