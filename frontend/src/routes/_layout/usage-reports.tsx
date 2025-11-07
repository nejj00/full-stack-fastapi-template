import { createFileRoute } from '@tanstack/react-router'
import PhoneBoothTreeFilter from "@/components/Common/PhoneBoothFilterTree"
import { useState, useMemo } from 'react'
import { Container, Heading, Spinner, Box, Text } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { UsageSessionsService } from '@/client'
import { PhoneBoothsService } from '@/client'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts'


function getUsageSessionsQuery() {
  return {
    queryKey: ["usageSessions"],
    queryFn: () => UsageSessionsService.readUsageSessions({ skip: 0, limit: 1000 }),
  }
}

function getPhoneBoothsQuery() {
  return {
    queryKey: ['phoneBooths'],
    queryFn: () => PhoneBoothsService.readPhoneBooths({ skip: 0, limit: 1000 }),
  }
}

export const Route = createFileRoute('/_layout/usage-reports')({
  component: UsageReportsComponent,
})

// 🎨 simple color palette for booths
const COLORS = [
  "#3182ce", // blue
  "#38a169", // green
  "#d69e2e", // yellow
  "#dd6b20", // orange
  "#805ad5", // purple
  "#e53e3e", // red
  "#319795", // teal
  "#718096", // gray
]

function UsageReportsComponent() {
  const [checkedItems, setCheckedItems] = useState<string[]>([])
  const { data, isLoading, isError, error } = useQuery(getUsageSessionsQuery())
  const { data: booths } = useQuery(getPhoneBoothsQuery())

  // ✅ Aggregate data by day + booth
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    const filtered = checkedItems.length
      ? data.filter((s: any) => checkedItems.includes(s.phone_booth_id))
      : data

    const usage: Record<string, Record<string, number>> = {}

    for (const session of filtered) {
      if (!session.start_time || !session.duration_seconds) continue
      const day = new Date(session.start_time).toISOString().split('T')[0]
      const boothId = session.phone_booth_id
      if (!usage[day]) usage[day] = {}
      usage[day][boothId] = (usage[day][boothId] || 0) + session.duration_seconds
    }

    // Convert to array with booth hours
    return Object.entries(usage)
      .map(([day, booths]) => {
        const entry: any = { day }
        for (const [boothId, totalSeconds] of Object.entries(booths)) {
          entry[boothId] = totalSeconds / 3600 // convert to hours
        }
        return entry
      })
      .sort((a, b) => a.day.localeCompare(b.day))
  }, [data, checkedItems])

  console.log("Chart Data:", chartData)

  // Collect unique booth IDs in dataset (for dynamic <Bar> creation)
  const boothIds = useMemo(() => {
    if (!chartData.length) return []
    const ids = new Set<string>()
    for (const d of chartData) {
      Object.keys(d).forEach((k) => {
        if (k !== 'day') ids.add(k)
      })
    }
    return Array.from(ids)
  }, [chartData])

  // Create a mapping from boothId → serial number
  const boothMap = useMemo(() => {
    const map: Record<string, string> = {}
    booths?.forEach((b: any) => {
      map[b.id] = b.serial_number
    })
    return map
  }, [booths])

  return (
    <Container maxW="full" pt={12}>
      <Heading size="lg" mb={4}>
        Usage Reports
      </Heading>

      <PhoneBoothTreeFilter onCheckedChange={setCheckedItems} />

      {isLoading && <Spinner mt={6} />}

      {isError && <Text color="red.500">Error: {error?.message}</Text>}

      {!isLoading && chartData.length === 0 && (
        <Text mt={6}>No usage data found for the selected booths.</Text>
      )}

      {chartData.length > 0 && (
        <Box mt={12}>
          <Heading size="md" mb={3}>
            Daily Busy Hours per Booth
          </Heading>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              {boothIds.map((boothId, index) => (
                <Bar
                  key={boothId}
                  dataKey={boothId}
                  stackId="a"
                  fill={COLORS[index % COLORS.length]}
                  name={boothMap[boothId] || `Booth ${boothId.slice(0, 6)}`} // Short label
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Container>
  )
}
