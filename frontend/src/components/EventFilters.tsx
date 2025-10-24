import { HStack, Select, Button, Text } from '@chakra-ui/react'

interface FilterProps {
  onFilterChange: (filters: any) => void;
}

export default function EventFilters({ onFilterChange }: FilterProps) {
  const handleFilterChange = () => {
    // Implement filter logic
    const filters = {
      attackType: (document.getElementById('attackType') as HTMLSelectElement)?.value,
      threatLevel: (document.getElementById('threatLevel') as HTMLSelectElement)?.value
    }
    onFilterChange(filters)
  }

  return (
    <HStack spacing={4} mb={4} p={4} bg="gray.50" borderRadius="md">
      <Text fontWeight="bold">Filters:</Text>
      
      <Select 
        id="attackType" 
        placeholder="All Attack Types" 
        onChange={handleFilterChange}
        maxW="200px"
      >
        <option value="Data Exfiltration">Data Exfiltration</option>
        <option value="Privilege Escalation">Privilege Escalation</option>
        <option value="Unauthorized Access">Unauthorized Access</option>
        <option value="Malware Injection">Malware Injection</option>
        <option value="Dos Attack">DoS Attack</option>
        <option value="Reconnaissance">Reconnaissance</option>
      </Select>

      <Select 
        id="threatLevel" 
        placeholder="All Threat Levels" 
        onChange={handleFilterChange}
        maxW="200px"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </Select>

      <Button 
        size="sm" 
        colorScheme="red" 
        onClick={() => {
          (document.getElementById('attackType') as HTMLSelectElement).value = '';
          (document.getElementById('threatLevel') as HTMLSelectElement).value = '';
          onFilterChange({});
        }}
      >
        Clear Filters
      </Button>
    </HStack>
  )
}