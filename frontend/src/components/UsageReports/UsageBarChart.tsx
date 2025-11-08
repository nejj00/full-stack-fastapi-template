import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts"
import { Box, Heading } from "@chakra-ui/react"

interface Props {
  data: any[]
  boothIds: string[]
  boothMap: Record<string, string>
  colors: string[]
}

export function UsageBarChart({ data, boothIds, boothMap, colors }: Props) {
  // 🗓️ Helper for day of week label
  const formatDayOfWeek = (isoDate: string) => {
    const date = new Date(isoDate)
    return date.toLocaleDateString(undefined, { weekday: "long" }) // e.g. "Monday"
  }

  return (
    <Box mt={12}>
      <Heading size="md" mb={3}>
        Daily Busy Hours per Booth
      </Heading>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />

          <Tooltip
            formatter={(value, name) => [
              `${value} h`,
              boothMap[name] || name,
            ]}
            labelFormatter={(day) => {
              const weekday = formatDayOfWeek(day)
              return `${day} (${weekday})`
            }}
          />

          <Legend />

          {boothIds.map((boothId, index) => (
            <Bar
              key={boothId}
              dataKey={boothId}
              stackId="a"
              fill={colors[index % colors.length]}
              name={boothMap[boothId] || `Booth ${boothId.slice(0, 6)}`}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Box>
  )
}
