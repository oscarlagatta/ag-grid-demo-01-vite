import type { KPIStats, ServiceStatus, ServiceCharts } from "./types"

// Mock KPI data
export const mockKpiData: KPIStats = {
  recentIssues: { value: 204, change: "+8.93" },
  pendingIssues: { value: 34, change: "-10.64" },
  runningServices: { value: 34, change: "+4.29" },
  interruptions: { value: 204, change: "+12.5" },
}

// Mock services data
const services = [
  "US Wires",
  "India Payments",
  "China Payments",
  "Singapore",
  "Malaysia",
  "Service A",
  "Service B",
  "Service C",
  "Service D",
  "Service E",
]

function generateStatuses() {
  const statuses: Record<string, "✅" | "❌"> = {}
  for (let i = 0; i < 7; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const day = date.toLocaleDateString("en-US", { day: "numeric" })
    const month = date.toLocaleDateString("en-US", { month: "short" })
    const key = `${day} ${month}`
    statuses[key] = Math.random() > 0.2 ? "✅" : "❌"
  }
  return statuses
}

export const mockServicesData: ServiceStatus[] = services.map((service, index) => ({
  id: `service-${index + 1}`,
  service,
  statuses: generateStatuses(),
  currentHourlyAverage: `${(Math.random() * 3 + 1).toFixed(2)} sec`,
  averagePerDay: `${(Math.random() * 5 + 2).toFixed(2)} sec`,
}))

// Mock chart data generator
function generateRandomWalk(points: number, min: number, max: number, step: number) {
  const data = []
  let lastY = Math.random() * (max - min) + min
  for (let i = 0; i < points; i++) {
    let newY = lastY + (Math.random() * 2 - 1) * step
    newY = Math.max(min, Math.min(max, newY))
    data.push(newY)
    lastY = newY
  }
  return data
}

export function generateMockChartData(serviceId: string): ServiceCharts {
  const avgTransactionDurationData = generateRandomWalk(7, 5, 15, 1).map((y, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return {
      x: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      y: Number.parseFloat(y.toFixed(2)),
    }
  })

  const currentHourlyAverageData = generateRandomWalk(24, 2, 4, 0.2).map((y, i) => ({
    x: `${String(i).padStart(2, "0")}:00`,
    y: Number.parseFloat(y.toFixed(2)),
  }))

  return {
    averageTransactionDuration: avgTransactionDurationData,
    currentHourlyAverage: currentHourlyAverageData,
  }
}
