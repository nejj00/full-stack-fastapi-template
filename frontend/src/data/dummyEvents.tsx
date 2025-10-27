// src/data/dummyEvents.ts
export const dummyEvents = [
  {
    id: "1",
    title: "Booth A — Morning Shift",
    start: "2025-10-26T09:00:00",
    end: "2025-10-26T11:00:00",
    color: "#3182ce", // blue
  },
  {
    id: "2",
    title: "Booth B — Maintenance",
    start: "2025-10-26T10:00:00",
    end: "2025-10-26T12:30:00",
    color: "#38a169", // green
  },
  {
    id: "3",
    title: "Booth C — Reserved",
    start: "2025-10-26T11:00:00",
    end: "2025-10-26T13:00:00",
    color: "#d69e2e", // yellow
  },
  {
    id: "4",
    title: "Booth D — Interview Session",
    start: "2025-10-26T13:00:00",
    end: "2025-10-26T15:00:00",
    color: "#dd6b20", // orange
  },
  {
    id: "5",
    title: "Booth E — Team Call",
    start: "2025-10-26T14:00:00",
    end: "2025-10-26T15:30:00",
    color: "#805ad5", // purple
  },
  {
    id: "6",
    title: "Booth F — Busy",
    start: "2025-10-26T08:30:00",
    end: "2025-10-26T10:00:00",
    color: "#e53e3e", // red
  },
  {
    id: "7",
    title: "Booth G — Deep Work",
    start: "2025-10-26T15:00:00",
    end: "2025-10-26T17:00:00",
    color: "#319795", // teal
  },
  {
    id: "8",
    title: "Booth H — Client Demo",
    start: "2025-10-26T09:30:00",
    end: "2025-10-26T11:30:00",
    color: "#718096", // gray
  },
  {
    id: "9",
    title: "Booth I — Sales Call",
    start: "2025-10-26T12:00:00",
    end: "2025-10-26T13:30:00",
    color: "#9f7aea", // violet
  },
  {
    id: "10",
    title: "Booth J — Team Meeting",
    start: "2025-10-26T16:00:00",
    end: "2025-10-26T17:30:00",
    color: "#ed64a6", // pink
  },
  {
    id: "11",
    title: "Booth K — Tech Support",
    start: "2025-10-26T10:30:00",
    end: "2025-10-26T12:00:00",
    color: "#2b6cb0", // darker blue
  },
]

export const DUMMY_EVENTS_6_TO_8 = Array.from({ length: 12 }).map((_, i) => {
  const today = new Date()
  const startHour = 6 // 6 or 7
  const startMin = 0
  const start = new Date(today.setHours(startHour, startMin, 0, 0)).toISOString()
  const end = new Date(today.setHours(startHour + 1, startMin, 0, 0)).toISOString()

  return {
    id: `dummy-${i}`,
    title: `Booth Test Event ${i + 1}`,
    start,
    end,
    color: `hsl(${(i * 30) % 360}, 70%, 55%)`,
  }
})
