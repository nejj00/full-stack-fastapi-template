import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { UsageSessionsService, PhoneBoothsService } from "@/client"

const COLORS = [
  "#3182ce", "#38a169", "#d69e2e", "#dd6b20",
  "#805ad5", "#e53e3e", "#319795", "#718096",
]

export function useUsageReportsData(checkedItems: string[]) {
  const { data: sessions, isLoading, isError, error } = useQuery({
    queryKey: ["usageSessions"],
    queryFn: () => UsageSessionsService.readUsageSessions({ skip: 0, limit: 1000 }),
  })

  const { data: booths } = useQuery({
    queryKey: ["phoneBooths"],
    queryFn: () => PhoneBoothsService.readPhoneBooths({ skip: 0, limit: 1000 }),
  })

  // Map booth IDs → serial numbers
  const boothMap = useMemo(() => {
    const map: Record<string, string> = {}
    booths?.forEach((b: any) => {
      map[b.id] = b.serial_number
    })
    return map
  }, [booths])

  // Aggregate data per day + booth
  const chartData = useMemo(() => {
    if (!sessions || sessions.length === 0) return []

    const filtered = checkedItems.length
      ? sessions.filter((s: any) => checkedItems.includes(s.phone_booth_id))
      : sessions

    const usage: Record<string, Record<string, number>> = {}

    for (const s of filtered) {
      if (!s.start_time || !s.duration_seconds) continue
      const day = new Date(s.start_time).toISOString().split("T")[0]
      const booth = s.phone_booth_id
      if (!usage[day]) usage[day] = {}
      usage[day][booth] = (usage[day][booth] || 0) + s.duration_seconds
    }

    return Object.entries(usage)
      .map(([day, booths]) => {
        const entry: any = { day }
        for (const [boothId, seconds] of Object.entries(booths)) {
          entry[boothId] = (seconds as number) / 3600
        }
        entry.totalHours = Object.values(booths).reduce(
          (sum, sec) => sum + (sec as number) / 3600,
          0
        )
        return entry
      })
      .sort((a, b) => a.day.localeCompare(b.day))
  }, [sessions, checkedItems])

  // Extract booth IDs dynamically from data
  const boothIds = useMemo(() => {
    if (!chartData.length) return []
    const ids = new Set<string>()
    chartData.forEach((entry) => {
      Object.keys(entry).forEach((key) => {
        if (key !== "day" && key !== "totalHours") ids.add(key)
      })
    })
    return Array.from(ids)
  }, [chartData])

  return {
    chartData,
    boothIds,
    boothMap,
    isLoading,
    isError,
    error,
    COLORS,
  }
}
