import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { Container, Heading, Spinner, Text } from "@chakra-ui/react"
import PhoneBoothTreeFilter from "@/components/Common/PhoneBoothFilterTree"
import { useUsageReportsData } from "@/hooks/useUsageReportsData"
import { UsageLineChart } from "@/components/UsageReports/UsageLineChart"
import { UsageBarChart } from "@/components/UsageReports/UsageBarChart"

export const Route = createFileRoute("/_layout/usage-reports")({
  component: UsageReportsPage,
})

function UsageReportsPage() {
  const [checkedItems, setCheckedItems] = useState<string[]>([])
  const { chartData, boothIds, boothMap, isLoading, isError, error, COLORS } =
    useUsageReportsData(checkedItems)

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
        <>
          <UsageLineChart data={chartData} />
          <UsageBarChart
            data={chartData}
            boothIds={boothIds}
            boothMap={boothMap}
            colors={COLORS}
          />
        </>
      )}
    </Container>
  )
}
