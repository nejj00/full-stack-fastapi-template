import { useMemo } from "react"
import { Box, Heading, Table } from "@chakra-ui/react"

interface BoothInfo {
  name: string
  workingHours: number
}

interface Props {
  data: any[]
  boothIds: string[]
  boothMap: Record<string, BoothInfo>
  selectedDates: Date[]
}

export function UsageTable({ data, boothIds, boothMap, selectedDates }: Props) {
  // 🧮 Compute summary table data
  const summaryData = useMemo(() => {
    if (!data.length || !boothIds.length) return []

    const totalDays =
      selectedDates.length === 2
        ? Math.ceil(
            (selectedDates[1].getTime() - selectedDates[0].getTime()) /
              (1000 * 60 * 60 * 24)
          ) + 1
        : 1

    return boothIds.map((boothId) => {
      const boothInfo = boothMap[boothId]
      const workingHours = boothInfo?.workingHours || 8
      const totalAvailableHours = totalDays * workingHours
      
      const totalUsage = data.reduce((sum, day) => sum + (day[boothId] || 0), 0)
      const percentage = (totalUsage / totalAvailableHours) * 100

      return {
        id: boothId,
        booth: boothInfo?.name || boothId,
        totalUsage,
        totalAvailableHours,
        percentage,
        workingHours,
      }
    })
  }, [data, boothIds, boothMap, selectedDates])

  return (
    <Box mt={12}>
      <Heading size="md" mb={3}>
        Booth Usage Summary
      </Heading>
      <Table.Root size="sm" variant="outline">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Client / Booth</Table.ColumnHeader>
            <Table.ColumnHeader>Working Hours/Day</Table.ColumnHeader>
            <Table.ColumnHeader>Usage (hrs)</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="end">Usage %</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {summaryData.map((item) => (
            <Table.Row key={item.id}>
              <Table.Cell>{item.booth}</Table.Cell>
              <Table.Cell>{item.workingHours}</Table.Cell>
              <Table.Cell>
                {item.totalUsage.toFixed(2)}/{item.totalAvailableHours}
              </Table.Cell>
              <Table.Cell textAlign="end">
                {item.percentage.toFixed(1)}%
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  )
}