import { useQuery } from "@tanstack/react-query"
import type { KPIStats, ServiceStatus, ServiceCharts } from "./types"
import { mockKpiData, mockServicesData, generateMockChartData } from "./mockData"

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function useKpis() {
  return useQuery<KPIStats>({
    queryKey: ["kpis"],
    queryFn: async () => {
      await delay(500)
      return mockKpiData
    },
  })
}

export function useServices() {
  return useQuery<ServiceStatus[]>({
    queryKey: ["services"],
    queryFn: async () => {
      await delay(1000)
      return mockServicesData
    },
  })
}

export function useServiceCharts(serviceId: string) {
  return useQuery<ServiceCharts>({
    queryKey: ["service-charts", serviceId],
    queryFn: async () => {
      await delay(800)
      return generateMockChartData(serviceId)
    },
    enabled: !!serviceId,
  })
}
