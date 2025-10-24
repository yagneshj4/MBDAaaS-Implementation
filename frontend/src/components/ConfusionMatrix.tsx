import { useEffect, useState } from 'react'
import { Box, Heading, SimpleGrid, Text, VStack, HStack, Badge } from '@chakra-ui/react'

interface ConfusionMatrixData {
  confusion_matrix: {
    true_negative: number;
    false_positive: number;
    false_negative: number;
    true_positive: number;
  };
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    specificity: number;
  };
  test_size: number;
}

export default function ConfusionMatrix() {
  const [data, setData] = useState<ConfusionMatrixData | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/model-metrics')
        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error('Failed to fetch model metrics:', err)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  if (!data || data.confusion_matrix === undefined) {
    return null
  }

  const { confusion_matrix: cm, metrics } = data

  return (
    <Box bg="white" p={6} borderRadius="lg" shadow="md">
      <Heading size="md" mb={4} color="gray.700">
        🎯 ML Model Performance (Paper §5)
      </Heading>

      <SimpleGrid columns={2} spacing={6}>
        {/* Confusion Matrix Visualization */}
        <Box>
          <Text fontWeight="semibold" mb={3} color="gray.600">
            Confusion Matrix
          </Text>
          <SimpleGrid columns={2} spacing={2}>
            <Box 
              p={4} 
              bg="green.50" 
              borderRadius="md" 
              border="2px" 
              borderColor="green.400"
              textAlign="center"
            >
              <Text fontSize="2xl" fontWeight="bold" color="green.700">
                {cm.true_negative}
              </Text>
              <Text fontSize="xs" color="gray.600">True Negative</Text>
            </Box>
            
            <Box 
              p={4} 
              bg="orange.50" 
              borderRadius="md" 
              border="2px" 
              borderColor="orange.400"
              textAlign="center"
            >
              <Text fontSize="2xl" fontWeight="bold" color="orange.700">
                {cm.false_positive}
              </Text>
              <Text fontSize="xs" color="gray.600">False Positive</Text>
            </Box>
            
            <Box 
              p={4} 
              bg="orange.50" 
              borderRadius="md" 
              border="2px" 
              borderColor="orange.400"
              textAlign="center"
            >
              <Text fontSize="2xl" fontWeight="bold" color="orange.700">
                {cm.false_negative}
              </Text>
              <Text fontSize="xs" color="gray.600">False Negative</Text>
            </Box>
            
            <Box 
              p={4} 
              bg="green.50" 
              borderRadius="md" 
              border="2px" 
              borderColor="green.400"
              textAlign="center"
            >
              <Text fontSize="2xl" fontWeight="bold" color="green.700">
                {cm.true_positive}
              </Text>
              <Text fontSize="xs" color="gray.600">True Positive</Text>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Performance Metrics */}
        <VStack align="stretch" spacing={3}>
          <Text fontWeight="semibold" color="gray.600">
            Performance Metrics
          </Text>
          
          <HStack justify="space-between" p={3} bg="blue.50" borderRadius="md">
            <Text fontSize="sm" fontWeight="medium">Accuracy:</Text>
            <Badge colorScheme="blue" fontSize="md">
              {(metrics.accuracy * 100).toFixed(1)}%
            </Badge>
          </HStack>
          
          <HStack justify="space-between" p={3} bg="green.50" borderRadius="md">
            <Text fontSize="sm" fontWeight="medium">Precision:</Text>
            <Badge colorScheme="green" fontSize="md">
              {(metrics.precision * 100).toFixed(1)}%
            </Badge>
          </HStack>
          
          <HStack justify="space-between" p={3} bg="purple.50" borderRadius="md">
            <Text fontSize="sm" fontWeight="medium">Recall:</Text>
            <Badge colorScheme="purple" fontSize="md">
              {(metrics.recall * 100).toFixed(1)}%
            </Badge>
          </HStack>
          
          <HStack justify="space-between" p={3} bg="orange.50" borderRadius="md">
            <Text fontSize="sm" fontWeight="medium">Specificity:</Text>
            <Badge colorScheme="orange" fontSize="md">
              {(metrics.specificity * 100).toFixed(1)}%
            </Badge>
          </HStack>

          <Text fontSize="xs" color="gray.500" mt={2}>
            Test size: {data.test_size} samples
          </Text>
        </VStack>
      </SimpleGrid>
    </Box>
  )
}