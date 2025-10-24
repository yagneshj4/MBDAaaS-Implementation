import { useEffect, useState } from 'react'
import { Box, Heading, Text, VStack, Badge, HStack } from '@chakra-ui/react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'

interface ROCData {
  fpr: number[];
  tpr: number[];
  thresholds: number[];
  auc: number;
  interpretation: {
    auc: number;
    quality: string;
  };
}

export default function ROCCurve() {
  const [rocData, setRocData] = useState<ROCData | null>(null)

  useEffect(() => {
    const fetchROC = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/model-roc')
        const data = await response.json()
        setRocData(data)
      } catch (err) {
        console.error('Failed to fetch ROC data:', err)
      }
    }

    fetchROC()
    const interval = setInterval(fetchROC, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  if (!rocData || rocData.fpr === undefined) {
    return null
  }

  // Transform data for recharts
  const chartData = rocData.fpr.map((fpr, idx) => ({
    fpr: fpr,
    tpr: rocData.tpr[idx],
    threshold: rocData.thresholds[idx]
  }))

  // Add diagonal reference line data
  const referenceData = [
    { fpr: 0, tpr: 0 },
    { fpr: 1, tpr: 1 }
  ]

  const getAUCColor = (auc: number) => {
    if (auc >= 0.95) return 'green'
    if (auc >= 0.90) return 'blue'
    if (auc >= 0.80) return 'orange'
    return 'red'
  }

  return (
    <Box bg="white" p={6} borderRadius="lg" shadow="md">
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
          <Heading size="md" color="gray.700">
            📈 ROC Curve Analysis
          </Heading>
          <Badge 
            colorScheme={getAUCColor(rocData.auc)} 
            fontSize="lg"
            px={3}
            py={1}
          >
            AUC: {rocData.auc.toFixed(4)}
          </Badge>
        </HStack>

        <HStack spacing={4}>
          <Badge colorScheme="purple">
            Quality: {rocData.interpretation.quality}
          </Badge>
          <Text fontSize="xs" color="gray.500">
            Area Under Curve (AUC) measures classifier performance
          </Text>
        </HStack>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="fpr" 
              type="number"
              domain={[0, 1]}
              label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              type="number"
              domain={[0, 1]}
              label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value: number) => value.toFixed(3)}
              labelFormatter={(label) => `FPR: ${label}`}
            />
            <Legend />
            
            {/* Diagonal reference line (random classifier) */}
            <Line
              data={referenceData}
              dataKey="tpr"
              stroke="#cccccc"
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
              name="Random Classifier"
            />
            
            {/* ROC Curve */}
            <Line
              data={chartData}
              dataKey="tpr"
              stroke="#8884d8"
              strokeWidth={3}
              dot={false}
              name={`ML Model (AUC=${rocData.auc.toFixed(3)})`}
            />
          </LineChart>
        </ResponsiveContainer>

        <HStack justify="space-between" fontSize="xs" color="gray.600">
          <Text>✅ Perfect classifier: AUC = 1.0</Text>
          <Text>⚠️ Random guess: AUC = 0.5</Text>
        </HStack>

        <Box bg="blue.50" p={3} borderRadius="md">
          <Text fontSize="sm" color="gray.700">
            <strong>Interpretation:</strong> AUC of {rocData.auc.toFixed(4)} indicates 
            {rocData.auc >= 0.95 ? ' perfect' : ' excellent'} discrimination between 
            normal and suspicious events. The model can correctly identify threats 
            with minimal false positives.
          </Text>
        </Box>
      </VStack>
    </Box>
  )
}
