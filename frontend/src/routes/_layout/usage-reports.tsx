import { createFileRoute } from '@tanstack/react-router'
import PhoneBoothTreeFilter from "@/components/Common/PhoneBoothFilterTree"
import { useState, useMemo } from 'react'
import { Container, Heading, Spinner, Box, Text } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { UsageSessionsService } from '@/client'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

// Fetch all usage sessions
function getUsageSessionsQuery() {
  return {
    queryKey: ["usageSessions"],
    queryFn: () => UsageSessionsService.readUsageSessions({ skip: 0, limit: 1000 }),
  }
}

export const Route = createFileRoute('/_layout/usage-reports')({
  component: UsageReportsComponent,
})

function UsageReportsComponent() {
  const [checkedItems, setCheckedItems] = useState<string[]>([])

  // Fetch all usage sessions
  const { data, isLoading, isError, error } = useQuery(getUsageSessionsQuery())

  // Filter & aggregate
  const dailyUsage = useMemo(() => {
    if (!data || data.length === 0) return []

    // Filter to selected booths (if any)
    const filtered = checkedItems.length
      ? data.filter((s: any) => checkedItems.includes(s.phone_booth_id))
      : data

    // Aggregate by day
    const usageByDay: Record<string, number> = {}
    for (const session of filtered) {
      if (!session.start_time || !session.duration_seconds) continue
      const day = new Date(session.start_time).toISOString().split('T')[0]
      usageByDay[day] = (usageByDay[day] || 0) + session.duration_seconds
    }

    // Convert to chart-friendly format (hours/day)
    return Object.entries(usageByDay)
      .map(([day, totalSeconds]) => ({
        day,
        total_hours: totalSeconds / 3600,
      }))
      .sort((a, b) => a.day.localeCompare(b.day))
  }, [data, checkedItems])

  return (
    <Container maxW="full" pt={12}>
      <Heading size="lg" mb={4}>
        Usage Reports
      </Heading>

      <PhoneBoothTreeFilter onCheckedChange={setCheckedItems} />

      {isLoading && <Spinner mt={6} />}

      {isError && <Text color="red.500">Error: {error?.message}</Text>}

      {!isLoading && dailyUsage.length === 0 && (
        <Text mt={6}>No usage data found for the selected booths.</Text>
      )}

      {dailyUsage.length > 0 && (
        <Box mt={8}>
          <Heading size="md" mb={3}>
            Daily Usage (hours)
          </Heading>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyUsage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="total_hours"
                stroke="#3182ce"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Container>
  )
}