import { Container, Heading, List, Spinner, Text } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import { PhoneBoothsService } from "@/client"
import { useQuery } from "@tanstack/react-query"
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'

function getBusyPhoneBoothsQuery() {
  return {
    queryKey: ["busyPhoneBooths"],
    queryFn: () => PhoneBoothsService.readBusyPhoneBooths({ skip: 0, limit: 100 }),
  }
}

export const Route = createFileRoute("/_layout/booth-calendar")({
  component: BoothCalendar,
})

function BusyPhoneBoothsList() {
  const { data, isLoading, isError, error } = useQuery(getBusyPhoneBoothsQuery())

  if (isLoading) return <Spinner/>
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
  
  
  return (
    <div style={{ marginTop: '40px' }}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        initialView='dayGridMonth'
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
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
      <BusyPhoneBoothsList />
      <CalendarView />
    </Container>
  )
}
