import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta
import random
import os

print("=" * 80)
print("SMART GRID SECURITY ANALYTICS")
print("Dataset Generator: IoT + Cybersecurity Hybrid Data")
print("=" * 80)

# Configuration
NUM_EVENTS = 300
NORMAL_RATIO = 0.8

def generate_clean_event(is_suspicious=False, event_id=0):
    """Generate one clean, understandable event"""
    
    # Timestamp
    event_time = datetime.now() - timedelta(hours=random.randint(0, 24))
    
    # Device configuration
    device_types = ['smart_meters', 'transformers', 'controllers', 'sensors']
    device_type = random.choice(device_types)
    device_id = f"{device_type[:2].upper()}_{random.randint(1, 100):04d}"
    
    # Location
    if is_suspicious:
        location = random.choice(['External', 'Dark_Web', 'VPN_Tunnel', 'Unknown_Zone'])
        ip_address = f"192.168.{random.randint(200, 255)}.{random.randint(1, 255)}"
    else:
        location = random.choice(['Zone_A', 'Zone_B', 'Zone_C', 'Zone_D'])
        ip_address = f"10.{random.randint(0, 5)}.{random.randint(1, 255)}.{random.randint(1, 255)}"
    
    # IoT sensor readings
    if is_suspicious:
        voltage = round(random.uniform(180, 260), 2)
        current = round(random.uniform(0.1, 30), 2)
        temperature = round(random.uniform(15, 95), 1)
    else:
        voltage = round(random.uniform(210, 245), 2)
        current = round(random.uniform(0.5, 20), 2)
        temperature = round(random.uniform(20, 80), 1)
    
    power_factor = round(random.uniform(0.6, 0.99), 2)
    frequency = round(random.uniform(49.5, 50.5), 2)
    load = round(random.uniform(0.5, 15), 2)
    
    # Security context
    if is_suspicious:
        # SUSPICIOUS EVENT
        user_list = ['admin_001', 'admin_002', 'backdoor_user', 'temp_admin', 'contractor_ext']
        user_id = random.choice(user_list)
        action = random.choice(['ADMIN_READ', 'ADMIN_WRITE', 'DELETE'])
        table_name = random.choice(['billing_records', 'customer_pii', 'payment_info', 'scada_control'])
        threat_level = random.choice(['high', 'critical'])
        
        # CLEAR attack information (NO "None" string, use null)
        attack_info = {
            'Data Exfiltration': 'Unauthorized data extraction',
            'Privilege Escalation': 'Elevation of user privileges',
            'Unauthorized Access': 'Access without credentials',
            'Malware Injection': 'Malicious code insertion',
            'DoS Attack': 'Denial of Service attack',
            'Reconnaissance': 'Network scanning'
        }
        attack_type = random.choice(list(attack_info.keys()))
        attack_description = attack_info[attack_type]
        attack_category = attack_type.lower().replace(' ', '_')
        indicators = 'multiple_queries,unusual_access,after_hours'
        confidence = round(random.uniform(0.75, 0.95), 2)
        session_id = f"suspicious_{random.randint(1000000, 9999999)}"
        
    else:
        # NORMAL EVENT
        user_list = [f'user_{i}' for i in range(1, 51)] + ['operator_1', 'engineer_1']
        user_id = random.choice(user_list)
        action = random.choice(['READ', 'UPDATE', 'WRITE'])
        table_name = random.choice(['meter_readings', 'device_status', 'usage_patterns', 'sensor_data'])
        threat_level = random.choice(['low', 'medium'])
        
        # CLEAR: null for normal events (proper JSON, not "None" string)
        attack_type = None
        attack_description = 'Normal operation'
        attack_category = None
        indicators = 'normal_pattern'
        confidence = round(random.uniform(0.90, 0.99), 2)
        session_id = f"normal_{random.randint(1000000, 9999999)}"
    
    # Build clean event (NO NaN, NO "None" strings)
    event = {
        'timestamp': event_time.isoformat(),
        'event_id': f"EVT_{event_id:06d}",
        'user_id': user_id,
        'action': action,
        'table_name': table_name,
        'ip_address': ip_address,
        'session_id': session_id,
        'device_id': device_id,
        'device_type': device_type,
        'location': location,
        'voltage': voltage,
        'current': current,
        'power_factor': power_factor,
        'frequency': frequency,
        'temperature': temperature,
        'load': load,
        'is_suspicious': is_suspicious,
        'threat_level': threat_level,
        'attack_type': attack_type,  # null for normal, string for suspicious
        'attack_category': attack_category,
        'attack_description': attack_description,
        'indicators': indicators,
        'confidence_score': confidence
    }
    
    return event

# Generate events
print(f"\n🔧 Generating {NUM_EVENTS} events...")
events = []

num_normal = int(NUM_EVENTS * NORMAL_RATIO)
num_suspicious = NUM_EVENTS - num_normal

for i in range(num_normal):
    events.append(generate_clean_event(is_suspicious=False, event_id=i))

for i in range(num_suspicious):
    events.append(generate_clean_event(is_suspicious=True, event_id=num_normal + i))

random.shuffle(events)

# Create output folder
os.makedirs('data/processed_data', exist_ok=True)

# Save files
output_json = 'data/processed_data/hybrid_events.json'
with open(output_json, 'w') as f:
    json.dump(events, f, indent=2)

# Also save to main data folder for backward compatibility
with open('data/events.json', 'w') as f:
    json.dump(events, f, indent=2)

# Save CSV
df = pd.DataFrame(events)
df.to_csv('data/processed_data/hybrid_events.csv', index=False)
df.to_csv('data/smart_grid_security.csv', index=False)

print(f"\n✅ Files saved:")
print(f"  1. {output_json}")
print(f"  2. data/events.json (for backend)")
print(f"  3. data/processed_data/hybrid_events.csv")
print(f"  4. data/smart_grid_security.csv (for backend)")

print(f"\n📊 Statistics:")
print(f"  Total: {len(events)}")
print(f"  Normal: {num_normal}")
print(f"  Suspicious: {num_suspicious}")
print("\n✅ DONE! No NaN values, clean JSON format")
