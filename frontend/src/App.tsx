import { useEffect, useState } from 'react'
import { 
  ChakraProvider,
  Box, 
  Container, 
  Heading, 
  Text, 
  SimpleGrid,
  VStack,
  HStack,
  Spinner,
  Badge,
  Button,
  Select,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  List,
  ListItem
} from '@chakra-ui/react'
import { getTestData, getHealth } from './services/api'
import LiveEvents from './components/LiveEvents'
import ThreatCharts from './components/ThreatCharts'
import ConfusionMatrix from './components/ConfusionMatrix'
import ROCCurve from './components/ROCCurve'

interface TestData {
  message: string;
  data: {
    total_events: number;
    anomalies: number;
    accuracy: number;
  }
}

interface HealthData {
  status: string;
  services: {
    api: string;
  }
}

interface NosyAdminData {
  nosy_admins: Record<string, number>;
  threshold: number;
  total_admin_reads: number;
}

function Dashboard() {
  const [testData, setTestData] = useState<TestData | null>(null)
  const [healthData, setHealthData] = useState<HealthData | null>(null)
  const [nosyAdmins, setNosyAdmins] = useState<NosyAdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [test, health, nosyAdmin] = await Promise.all([
          getTestData(),
          getHealth(),
          fetch('http://127.0.0.1:8000/api/detect/nosy-admin').then(r => r.json())
        ])
        setTestData(test)
        setHealthData(health)
        setNosyAdmins(nosyAdmin)
        setLastUpdate(new Date())
        setLoading(false)
      } catch (err) {
        setError('Failed to connect to backend')
        setLoading(false)
      }
    }
    
    fetchData()
    const interval = setInterval(fetchData, 10000)
    
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.900">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.400" thickness="4px" />
          <Text fontSize="lg" color="white">Initializing Security Dashboard...</Text>
        </VStack>
      </Box>
    )
  }

  if (error) {
    return (
      <Box minH="100vh" bg="gray.900" display="flex" alignItems="center" justifyContent="center">
        <Box bg="red.900" p={8} borderRadius="lg" border="2px" borderColor="red.500" maxW="600px">
          <Heading size="lg" color="red.200" mb={4}>
            ⚠️ Connection Error
          </Heading>
          <Text color="red.100" mb={4}>
            {error}. Ensure backend is running on http://127.0.0.1:8000
          </Text>
          <Button colorScheme="red" onClick={() => window.location.reload()}>
            Retry Connection
          </Button>
        </Box>
      </Box>
    )
  }

  const hasNosyAdmins = nosyAdmins && Object.keys(nosyAdmins.nosy_admins || {}).length > 0;

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Full-Width Header */}
      <Box bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" py={6} shadow="lg">
        <Container maxW="container.2xl">
          <Flex justify="space-between" align="center">
            <VStack align="start" spacing={2}>
              <HStack>
                <Text fontSize="4xl" fontWeight="bold" color="white">
                  🔒 Smart Grid Security Analytics
                </Text>
                <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                  LIVE
                </Badge>
              </HStack>
              <Text fontSize="lg" color="whiteAlpha.900">
                Real-time Threat Detection Dashboard - MBDAaaS Implementation
              </Text>
              <HStack spacing={4} mt={2}>
                <Badge colorScheme={healthData?.status === 'healthy' ? 'green' : 'red'} fontSize="sm" px={3} py={1}>
                  System: {healthData?.status.toUpperCase()}
                </Badge>
                <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
                  Last Update: {lastUpdate.toLocaleTimeString()}
                </Badge>
              </HStack>
            </VStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.2xl" py={8}>
        {/* Nosy Admin Alert */}
        {hasNosyAdmins && (
          <Alert status="warning" mb={6} borderRadius="lg" border="2px" borderColor="orange.400">
            <AlertIcon boxSize={6} />
            <Box flex="1">
              <AlertTitle fontSize="lg">🚨 Security Alert: Nosy Admin Detected (Paper §3.2)</AlertTitle>
              <AlertDescription>
                {Object.entries(nosyAdmins.nosy_admins).map(([user, count]) => (
                  <Text key={user} fontWeight="bold">
                    {user}: {count} unauthorized reads on sensitive data
                  </Text>
                ))}
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Data Sources Section */}
        <Box bg="white" p={8} borderRadius="xl" shadow="xl" mb={6} border="1px" borderColor="gray.200">
          <HStack mb={6} justify="space-between">
            <Heading size="lg" color="gray.800">
              📊 Hybrid Data Sources Integration
            </Heading>
            <Badge colorScheme="purple" fontSize="md" px={4} py={2}>
              2 Datasets Combined
            </Badge>
          </HStack>
          
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
            {/* Dataset 1 */}
            <Box 
              p={6} 
              bg="linear-gradient(135deg, #667eea20 0%, #764ba240 100%)"
              borderRadius="lg"
              border="2px solid"
              borderColor="purple.300"
              transition="all 0.3s"
              _hover={{ transform: 'translateY(-4px)', shadow: 'xl' }}
            >
              <VStack align="start" spacing={3}>
                <HStack>
                  <Text fontSize="2xl">⚡</Text>
                  <Heading size="md" color="purple.700">
                    IoT Smart Grid Dataset
                  </Heading>
                </HStack>
                <Divider />
                <List spacing={2} fontSize="sm" color="gray.700">
                  <ListItem>✓ <strong>Source:</strong> IIoT Smart Grid Sensors</ListItem>
                  <ListItem>✓ <strong>Metrics:</strong> Voltage, Current, Power, Temperature</ListItem>
                  <ListItem>✓ <strong>Type:</strong> Real-time sensor readings</ListItem>
                  <ListItem>✓ <strong>Purpose:</strong> Physical infrastructure monitoring</ListItem>
                </List>
                <Badge colorScheme="purple" fontSize="sm">DATASET 1 OF 2</Badge>
              </VStack>
            </Box>

            {/* Dataset 2 */}
            <Box 
              p={6} 
              bg="linear-gradient(135deg, #f093fb20 0%, #f5576c40 100%)"
              borderRadius="lg"
              border="2px solid"
              borderColor="red.300"
              transition="all 0.3s"
              _hover={{ transform: 'translateY(-4px)', shadow: 'xl' }}
            >
              <VStack align="start" spacing={3}>
                <HStack>
                  <Text fontSize="2xl">🔒</Text>
                  <Heading size="md" color="red.700">
                    UNSW-NB15 Cybersecurity Dataset
                  </Heading>
                </HStack>
                <Divider />
                <List spacing={2} fontSize="sm" color="gray.700">
                  <ListItem>✓ <strong>Source:</strong> UNSW-NB15 Network Intrusion</ListItem>
                  <ListItem>✓ <strong>Categories:</strong> 9 attack types</ListItem>
                  <ListItem>✓ <strong>Type:</strong> Attack patterns & threat signatures</ListItem>
                  <ListItem>✓ <strong>Purpose:</strong> Cyber threat detection</ListItem>
                </List>
                <Badge colorScheme="red" fontSize="sm">DATASET 2 OF 2</Badge>
              </VStack>
            </Box>
          </SimpleGrid>

          {/* Hybrid Result */}
          <Box 
            p={6} 
            bg="linear-gradient(135deg, #4facfe20 0%, #00f2fe40 100%)" 
            borderRadius="lg"
            border="2px dashed"
            borderColor="blue.400"
          >
            <Flex justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <HStack>
                  <Text fontSize="2xl">🔄</Text>
                  <Heading size="md" color="blue.700">
                    Combined Hybrid Dataset
                  </Heading>
                </HStack>
                <Text fontSize="sm" color="blue.600" fontWeight="medium">
                  Both datasets merged for comprehensive IoT + Cybersecurity threat analysis
                </Text>
              </VStack>
              <Stat>
                <StatNumber fontSize="4xl" color="blue.700">
                  {testData?.data.total_events.toLocaleString()}
                </StatNumber>
                <StatLabel color="blue.600">Total Events</StatLabel>
                <StatHelpText color="blue.500">Generated & Analyzed</StatHelpText>
              </Stat>
            </Flex>
          </Box>
        </Box>

        {/* HOW IT WORKS Section */}
        <Box bg="white" p={8} borderRadius="xl" shadow="xl" mb={6} border="1px" borderColor="gray.200">
          <Heading size="lg" mb={6} color="gray.800">
            ⚙️ How Our System Works
          </Heading>
          
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
            <Box p={4} bg="blue.50" borderRadius="md" textAlign="center">
              <Text fontSize="3xl" mb={2}>📥</Text>
              <Heading size="sm" mb={2} color="blue.700">1. Data Ingestion</Heading>
              <Text fontSize="xs" color="gray.600">
                Combines IoT sensor data with cybersecurity threat patterns
              </Text>
            </Box>
            
            <Box p={4} bg="purple.50" borderRadius="md" textAlign="center">
              <Text fontSize="3xl" mb={2}>🔒</Text>
              <Heading size="sm" mb={2} color="purple.700">2. Privacy Protection</Heading>
              <Text fontSize="xs" color="gray.600">
                Applies ε-Differential Privacy (PrivBayes) for secure analysis
              </Text>
            </Box>
            
            <Box p={4} bg="green.50" borderRadius="md" textAlign="center">
              <Text fontSize="3xl" mb={2}>🤖</Text>
              <Heading size="sm" mb={2} color="green.700">3. ML Detection</Heading>
              <Text fontSize="xs" color="gray.600">
                Random Forest classifier predicts threats with {((testData?.data.accuracy || 0) * 100).toFixed(0)}% accuracy
              </Text>
            </Box>
            
            <Box p={4} bg="orange.50" borderRadius="md" textAlign="center">
              <Text fontSize="3xl" mb={2}>📊</Text>
              <Heading size="sm" mb={2} color="orange.700">4. Real-time Dashboard</Heading>
              <Text fontSize="xs" color="gray.600">
                Live visualization and threat alerting
              </Text>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Metrics Cards */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          <Box 
            bg="white" 
            p={8} 
            borderRadius="xl" 
            shadow="xl" 
            borderLeft="6px solid"
            borderColor="blue.500"
            transition="all 0.3s"
            _hover={{ shadow: '2xl', transform: 'translateY(-4px)' }}
          >
            <VStack align="start" spacing={3}>
              <HStack>
                <Text fontSize="3xl">📈</Text>
                <Text fontSize="md" color="gray.600" fontWeight="bold">
                  Total Events
                </Text>
              </HStack>
              <Heading size="3xl" color="blue.600">
                {testData?.data.total_events.toLocaleString()}
              </Heading>
              <Text fontSize="sm" color="gray.500" fontWeight="medium">
                Last 24 hours • Live monitoring active
              </Text>
            </VStack>
          </Box>

          <Box 
            bg="white" 
            p={8} 
            borderRadius="xl" 
            shadow="xl" 
            borderLeft="6px solid"
            borderColor="red.500"
            transition="all 0.3s"
            _hover={{ shadow: '2xl', transform: 'translateY(-4px)' }}
          >
            <VStack align="start" spacing={3}>
              <HStack>
                <Text fontSize="3xl">⚠️</Text>
                <Text fontSize="md" color="gray.600" fontWeight="bold">
                  Anomalies Detected
                </Text>
              </HStack>
              <Heading size="3xl" color="red.600">
                {testData?.data.anomalies}
              </Heading>
              <Badge colorScheme="red" fontSize="sm">
                Requires Immediate Attention
              </Badge>
            </VStack>
          </Box>

          <Box 
            bg="white" 
            p={8} 
            borderRadius="xl" 
            shadow="xl" 
            borderLeft="6px solid"
            borderColor="green.500"
            transition="all 0.3s"
            _hover={{ shadow: '2xl', transform: 'translateY(-4px)' }}
          >
            <VStack align="start" spacing={3}>
              <HStack>
                <Text fontSize="3xl">🎯</Text>
                <Text fontSize="md" color="gray.600" fontWeight="bold">
                  Detection Accuracy
                </Text>
              </HStack>
              <Heading size="3xl" color="green.600">
                {((testData?.data.accuracy || 0) * 100).toFixed(1)}%
              </Heading>
              <Badge colorScheme="green" fontSize="sm">
                ML Model Performance
              </Badge>
            </VStack>
          </Box>
        </SimpleGrid>

        {/* Export & Filter Section */}
        <Box bg="white" p={6} borderRadius="xl" shadow="xl" mb={8} border="1px" borderColor="gray.200">
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Heading size="md" color="gray.700">
                📥 Export & Filter Data
              </Heading>
              <HStack spacing={3}>
                <Button 
                  colorScheme="blue" 
                  size="md"
                  onClick={() => window.open('http://127.0.0.1:8000/api/export/csv', '_blank')}
                >
                  📄 Download CSV
                </Button>
                <Button 
                  colorScheme="green"
                  size="md"
                  onClick={() => window.print()}
                >
                  🖨️ Print/PDF
                </Button>
              </HStack>
            </HStack>

            <HStack spacing={4} pt={4} borderTop="1px" borderColor="gray.200">
              <Text fontWeight="bold" color="gray.600">
                Filters:
              </Text>
              <Select 
                placeholder="All Attack Types" 
                size="md"
                maxW="250px"
                onChange={(e) => {
                  if (e.target.value) {
                    window.open(`http://127.0.0.1:8000/api/events/filter?attack_type=${e.target.value}`, '_blank');
                  }
                }}
              >
                <option value="Data Exfiltration">Data Exfiltration</option>
                <option value="Privilege Escalation">Privilege Escalation</option>
                <option value="Unauthorized Access">Unauthorized Access</option>
                <option value="Malware Injection">Malware Injection</option>
                <option value="Dos Attack">DoS Attack</option>
                <option value="Reconnaissance">Reconnaissance</option>
              </Select>

              <Select 
                placeholder="All Threat Levels" 
                size="md"
                maxW="250px"
                onChange={(e) => {
                  if (e.target.value) {
                    window.open(`http://127.0.0.1:8000/api/events/filter?threat_level=${e.target.value}`, '_blank');
                  }
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </Select>
            </HStack>
          </VStack>
        </Box>

        {/* System Info */}
        <Box bg="white" p={6} borderRadius="xl" shadow="xl" mb={8} border="1px" borderColor="gray.200">
          <Heading size="md" mb={4} color="gray.700">
            💻 System Information
          </Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <Box bg="blue.50" p={4} borderRadius="md">
              <HStack justify="space-between">
                <Text fontWeight="bold" color="gray.700">Backend Status:</Text>
                <Badge colorScheme="green" fontSize="md">{testData?.message}</Badge>
              </HStack>
            </Box>

            <Box bg="green.50" p={4} borderRadius="md">
              <HStack justify="space-between">
                <Text fontWeight="bold" color="gray.700">API Service:</Text>
                <Badge colorScheme="green" fontSize="md">{healthData?.services.api.toUpperCase()}</Badge>
              </HStack>
            </Box>
          </SimpleGrid>

          <Box mt={4} p={4} bg="gray.50" borderRadius="md">
            <Text color="gray.600" fontSize="sm">
              ✅ Real-time monitoring active • Using hybrid IoT + Cybersecurity datasets
              <br />
              📄 Paper: "Big Data Analytics-as-a-Service" (Ardagna et al., 2021)
            </Text>
          </Box>
        </Box>

        {/* Charts */}
        <Box mb={8}>
          <ThreatCharts />
        </Box>

        {/* ML Performance */}
        <Box mb={8}>
          <ConfusionMatrix />
        </Box>

        {/* ROC Curve */}
        <Box mb={8}>
          <ROCCurve />
        </Box>

        {/* Live Events */}
        <LiveEvents />
      </Container>
    </Box>
  )
}

function App() {
  return (
    <ChakraProvider>
      <Dashboard />
    </ChakraProvider>
  )
}

export default App
