import { useEffect, useState } from 'react'
import { Box, Heading, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface ChartData {
  timeline: Array<{ time: string; threats: number; normal: number }>;
  userActivity: Array<{ user: string; actions: number }>;
  actionDistribution: Array<{ name: string; value: number }>;
  attackTypes: Array<{ name: string; value: number }>;
}

export default function ThreatCharts() {
  const [chartData, setChartData] = useState<ChartData | null>(null)

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/live-events')
        const data = await response.json()
        const events = data.events || []

        // Process data for charts
        const timeline = processTimeline(events)
        const userActivity = processUserActivity(events)
        const actionDistribution = processActionDistribution(events)
        const attackTypes = processAttackTypes(data)

        setChartData({
          timeline,
          userActivity,
          actionDistribution,
          attackTypes
        })
      } catch (err) {
        console.error('Failed to fetch chart data:', err)
      }
    }

    fetchChartData()
    const interval = setInterval(fetchChartData, 10000)

    return () => clearInterval(interval)
  }, [])

  const processTimeline = (events: any[]) => {
    return events.map((event, idx) => ({
      time: `T${idx + 1}`,
      threats: event.is_suspicious ? 1 : 0,
      normal: event.is_suspicious ? 0 : 1
    }))
  }

  const processUserActivity = (events: any[]) => {
    const userCounts: Record<string, number> = {}
    events.forEach(event => {
      userCounts[event.user_id] = (userCounts[event.user_id] || 0) + 1
    })
    return Object.entries(userCounts)
      .slice(0, 5)
      .map(([user, actions]) => ({ user: user.slice(0, 15), actions }))
  }

  const processActionDistribution = (events: any[]) => {
    const actionCounts: Record<string, number> = {}
    events.forEach(event => {
      actionCounts[event.action] = (actionCounts[event.action] || 0) + 1
    })
    return Object.entries(actionCounts).map(([name, value]) => ({ name, value }))
  }

  const processAttackTypes = (data: any) => {
    const attackTypes = data.attack_types || {}
    return Object.entries(attackTypes).map(([name, value]) => ({ name, value: value as number }))
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B']

  if (!chartData) {
    return (
      <Box textAlign="center" py={10}>
        <Text>Loading analytics...</Text>
      </Box>
    )
  }

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg" color="gray.800">📊 Security Analytics Dashboard</Heading>

      <SimpleGrid columns={2} spacing={6}>
        {/* Threat Detection Timeline */}
        <Box bg="white" p={6} borderRadius="lg" shadow="md">
          <Heading size="md" mb={4} color="gray.700">🔍 Threat Detection Timeline</Heading>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData.timeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="threats" stroke="#FF4444" strokeWidth={2} name="Threats" />
              <Line type="monotone" dataKey="normal" stroke="#44DD44" strokeWidth={2} name="Normal" />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* User Activity */}
        <Box bg="white" p={6} borderRadius="lg" shadow="md">
          <Heading size="md" mb={4} color="gray.700">👥 Top User Activity</Heading>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData.userActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="user" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="actions" fill="#8884d8" name="Actions" />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Action Distribution */}
        <Box bg="white" p={6} borderRadius="lg" shadow="md">
          <Heading size="md" mb={4} color="gray.700">⚡ Action Distribution</Heading>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData.actionDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={entry => `${entry.name} (${entry.value})`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.actionDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Box>

        {/* Attack Types Distribution */}
        <Box bg="white" p={6} borderRadius="lg" shadow="md">
          <Heading size="md" mb={4} color="gray.700">🎯 Attack Types Distribution</Heading>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData.attackTypes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#FF6B6B" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </SimpleGrid>
    </VStack>
  )
}