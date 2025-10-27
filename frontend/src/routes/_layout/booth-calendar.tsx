import { Container, Heading, List, Spinner, Text } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import { PhoneBoothsService } from "@/client"
import { useQuery } from "@tanstack/react-query"
import { useState, useMemo } from "react"
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import PhoneBoothTreeFilter from "@/components/Common/PhoneBoothFilterTree"

const EVENT_COLORS = [
  "#3182ce", "#38a169", "#d69e2e", "#dd6b20",
  "#805ad5", "#e53e3e", "#319795", "#718096",
]

function getBusyPhoneBoothsQuery() {
  return {
    queryKey: ["busyPhoneBooths"],
    queryFn: () => PhoneBoothsService.readBusyPhoneBooths({ skip: 0, limit: 100 }),
    refetchInterval: 10000,
  }
}

export const Route = createFileRoute("/_layout/booth-calendar")({
  component: BoothCalendar,
})

// ---------------- LIST COMPONENT ----------------

function BusyPhoneBoothsList({ booths }: { booths: any[] }) {
  if (!booths) return <Spinner />

  if (booths.length === 0) {
    return <Text>No busy phone booths match the selected filters.</Text>
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

// ---------------- CALENDAR COMPONENT ----------------

function CalendarView({ booths }: { booths: any[] }) {
  const now = new Date().toISOString()

  const getColorForBooth = (boothId: string) => {
    let hash = 0
    for (let i = 0; i < boothId.length; i++) {
      hash = boothId.charCodeAt(i) + ((hash << 5) - hash)
    }
    return EVENT_COLORS[Math.abs(hash) % EVENT_COLORS.length]
  }

  const events = booths.map((booth: any) => ({
    id: booth.id,
    title: booth.name || 'Unknown Booth',
    start: booth.updated_at,
    end: now,
    color: getColorForBooth(booth.id),
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
        events={events}
        eventDisplay="block"
        height="auto"
      />
    </div>
  )
}

// ---------------- MAIN COMPONENT ----------------

function BoothCalendar() {
  const [checkedItems, setCheckedItems] = useState<string[]>([])

  const { data: allBooths, isLoading, isError, error } = useQuery(getBusyPhoneBoothsQuery())

  const filteredBooths = useMemo(() => {
    if (!allBooths) return []
    if (checkedItems.length === 0) return allBooths // nothing checked = show all

    // filter: only booths whose ID is in checkedItems
    return allBooths.filter((booth: any) => checkedItems.includes(booth.id))
  }, [allBooths, checkedItems])

  if (isLoading) {
    return (
      <Container maxW="full" pt={12} textAlign="center">
        <Spinner />
      </Container>
    )
  }

  if (isError) {
    return (
      <Container maxW="full" pt={12} textAlign="center">
        <Text color="red.500">Error: {error.message}</Text>
      </Container>
    )
  }

  return (
    <Container maxW="full" pt={12}>
      <Heading size="lg" mb={4}>
        Busy Phone Booths
      </Heading>

      <PhoneBoothTreeFilter onCheckedChange={setCheckedItems} />

      <BusyPhoneBoothsList booths={filteredBooths} />
      <CalendarView booths={filteredBooths} />
    </Container>
  )
}

export default BoothCalendar
