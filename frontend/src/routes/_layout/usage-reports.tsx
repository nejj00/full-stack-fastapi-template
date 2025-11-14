import { createFileRoute } from "@tanstack/react-router"
import { useState, useMemo } from "react"
import {
  Container,
  Heading,
  Spinner,
  Text,
  Stack,
  Table,
} from "@chakra-ui/react"
import { RangeDatepicker } from "chakra-dayzed-datepicker"
import PhoneBoothTreeFilter from "@/components/Common/PhoneBoothFilterTree"
import { useUsageReportsData } from "@/hooks/useUsageReportsData"
import { UsageLineChart } from "@/components/UsageReports/UsageLineChart"
import { UsageBarChart } from "@/components/UsageReports/UsageBarChart"

export const Route = createFileRoute("/_layout/usage-reports")({
  component: UsageReportsPage,
})

function UsageReportsPage() {
  const [checkedItems, setCheckedItems] = useState<string[]>([])

  const today = new Date()
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(today.getDate() - 6)
  const [selectedDates, setSelectedDates] = useState<Date[]>([sevenDaysAgo, today])

  const { chartData, boothIds, boothMap, isLoading, isError, error } =
    useUsageReportsData(
      checkedItems,
      selectedDates.length === 2 ? [selectedDates[0], selectedDates[1]] : undefined
    )
  
  console.log("UsageReportsPage render:", { chartData, boothIds, boothMap })

  // 🧮 Compute summary table data
  const summaryData = useMemo(() => {
    if (!chartData.length || !boothIds.length) return []

    const totalDays =
      selectedDates.length === 2
        ? Math.ceil(
            (selectedDates[1].getTime() - selectedDates[0].getTime()) /
              (1000 * 60 * 60 * 24)
          ) + 1
        : 1
    const totalAvailableHours = totalDays * 8 // 8 hours per day

    return boothIds.map((boothId) => {
      const totalUsage = chartData.reduce((sum, day) => sum + (day[boothId] || 0), 0)
      const percentage = (totalUsage / totalAvailableHours) * 100
      return {
        id: boothId,
        booth: boothMap[boothId] || boothId,
        totalUsage,
        totalAvailableHours,
        percentage,
      }
    })
  }, [chartData, boothIds, boothMap, selectedDates])

  return (
    <Container maxW="full" pt={12}>
      <Heading size="lg" mb={4}>
        Usage Reports
      </Heading>

      <PhoneBoothTreeFilter onCheckedChange={setCheckedItems} />

      <RangeDatepicker
        selectedDates={selectedDates}
        onDateChange={setSelectedDates}
      />

      {isLoading && <Spinner mt={6} />}
      {isError && <Text color="red.500">Error: {error?.message}</Text>}
      {!isLoading && chartData.length === 0 && (
        <Text mt={6}>No usage data found for the selected booths.</Text>
      )}

      {chartData.length > 0 && (
        <Stack gap="10" mt={8}>
          <UsageLineChart data={chartData} />
          <UsageBarChart
            data={chartData}
            boothIds={boothIds}
            boothMap={boothMap}
          />

          {/* ✅ Booth Usage Summary Table */}
          <Heading size="md" mt={8}>
            Booth Usage Summary
          </Heading>

          <Table.Root size="sm" variant="outline">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Client / Booth</Table.ColumnHeader>
                <Table.ColumnHeader>Usage (hrs)</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">Usage %</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {summaryData.map((item) => (
                <Table.Row key={item.id}>
                  <Table.Cell>{item.booth}</Table.Cell>
                  <Table.Cell>{item.totalUsage.toFixed(2)}/{item.totalAvailableHours}</Table.Cell>
                  <Table.Cell textAlign="end">
                    {item.percentage.toFixed(1)}%
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Stack>
      )}
    </Container>
  )
}
