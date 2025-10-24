import { useEffect, useState } from 'react'
import { Box, Heading, Text, VStack, Badge, HStack, Progress, Tooltip } from '@chakra-ui/react'

interface Event {
  timestamp: string;
  user_id: string;
  action: string;
  table_name: string;
  is_suspicious: boolean;
  ml_prediction?: {
    prediction: string;
    confidence: number;
  };
}

export default function LiveEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [stats, setStats] = useState({ total: 0, suspicious: 0 })

  useEffect(() => {
    const fetchEventsWithPredictions = async () => {
      try {
        // Fetch events
        const response = await fetch('http://127.0.0.1:8000/api/live-events')
        const data = await response.json()
        const rawEvents = data.events || []
        
        // Get ML predictions for each event
        const eventsWithPredictions = await Promise.all(
          rawEvents.map(async (event: Event) => {
            try {
              const predResponse = await fetch('http://127.0.0.1:8000/api/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event)
              })
              const prediction = await predResponse.json()
              return { ...event, ml_prediction: prediction }
            } catch {
              return event
            }
          })
        )
        
        setEvents(eventsWithPredictions)
        setStats({
          total: data.total_events || 0,
          suspicious: data.suspicious_count || 0
        })
      } catch (err) {
        console.error('Failed to fetch events:', err)
      }
    }

    fetchEventsWithPredictions()
    const interval = setInterval(fetchEventsWithPredictions, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'red'
    if (confidence > 0.6) return 'orange'
    return 'yellow'
  }

  return (
    <Box bg="white" p={6} borderRadius="lg" shadow="md">
      <HStack justify="space-between" mb={4}>
        <Heading size="md">🔴 Live Event Stream with ML Predictions</Heading>
        <HStack>
          <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
            Total: {stats.total}
          </Badge>
          <Badge colorScheme="red" fontSize="sm" px={3} py={1}>
            Threats: {stats.suspicious}
          </Badge>
        </HStack>
      </HStack>
      
      <VStack align="stretch" spacing={3} maxH="500px" overflowY="auto">
        {events.length > 0 ? (
          events.map((event, idx) => (
            <Box
              key={idx}
              p={4}
              borderRadius="md"
              bg={event.ml_prediction?.prediction === 'suspicious' ? 'red.50' : 'gray.50'}
              borderLeft="4px"
              borderLeftColor={event.ml_prediction?.prediction === 'suspicious' ? 'red.500' : 'green.500'}
              transition="all 0.3s"
              _hover={{ transform: 'translateX(5px)', shadow: 'md' }}
            >
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm" fontWeight="bold" color="gray.700">
                  {event.user_id}
                </Text>
                <HStack spacing={2}>
                  <Badge colorScheme={event.ml_prediction?.prediction === 'suspicious' ? 'red' : 'green'}>
                    {event.action}
                  </Badge>
                  {event.ml_prediction && (
                    <Tooltip label={`ML Confidence: ${(event.ml_prediction.confidence * 100).toFixed(1)}%`}>
                      <Badge colorScheme={getConfidenceColor(event.ml_prediction.confidence)}>
                        {event.ml_prediction.prediction.toUpperCase()}
                      </Badge>
                    </Tooltip>
                  )}
                </HStack>
              </HStack>
              
              <Text fontSize="xs" color="gray.600" mb={2}>
                📊 {event.table_name} • 🕒 {new Date(event.timestamp).toLocaleTimeString()}
              </Text>
              
              {event.ml_prediction && (
                <Box>
                  <HStack justify="space-between" mb={1}>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.600">
                      ML Confidence
                    </Text>
                    <Text fontSize="xs" fontWeight="bold" color={getConfidenceColor(event.ml_prediction.confidence) + '.600'}>
                      {(event.ml_prediction.confidence * 100).toFixed(1)}%
                    </Text>
                  </HStack>
                  <Progress 
                    value={event.ml_prediction.confidence * 100} 
                    size="sm" 
                    colorScheme={getConfidenceColor(event.ml_prediction.confidence)}
                    borderRadius="full"
                  />
                </Box>
              )}
            </Box>
          ))
        ) : (
          <Text color="gray.500" textAlign="center" py={8}>
            No events yet. Run the data generator first!
          </Text>
        )}
      </VStack>
    </Box>
  )
}