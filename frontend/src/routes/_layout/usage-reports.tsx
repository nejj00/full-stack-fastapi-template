import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import {
  Container,
  Heading,
  Spinner,
  Text,
  Stack,
} from "@chakra-ui/react"
import { RangeDatepicker } from "chakra-dayzed-datepicker"
import PhoneBoothTreeFilter from "@/components/Common/PhoneBoothFilterTree"
import { useUsageReportsData } from "@/hooks/useUsageReportsData"
import { UsageLineChart } from "@/components/UsageReports/UsageLineChart"
import { UsageBarChart } from "@/components/UsageReports/UsageBarChart"
import { UsageTable } from "@/components/UsageReports/UsageTable"

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
          <UsageTable
            data={chartData}
            boothIds={boothIds}
            boothMap={boothMap}
            selectedDates={selectedDates}
          />
        </Stack>
      )}
    </Container>
  )
}