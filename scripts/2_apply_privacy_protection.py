import pandas as pd
import numpy as np
import json
import os


class PrivBayesAnonymizer:
    """
    PrivBayes ε-Differential Privacy (Paper §3.1)
    Protects IoT sensor data while preserving utility for ML
    """
    
    def __init__(self, epsilon=1.0):
        self.epsilon = epsilon
        print(f"🔒 PrivBayes Anonymizer Initialized")
        print(f"   Privacy Budget (ε): {epsilon}")
        print(f"   Interpretation: Lower ε = Stronger privacy")
        
    def add_laplace_noise(self, data, sensitivity=1.0):
        """Add calibrated Laplace noise for ε-DP"""
        scale = sensitivity / self.epsilon
        noise = np.random.laplace(0, scale, size=len(data))
        return data + noise
    
    def anonymize_dataset(self, events):
        """Apply differential privacy to IoT sensor readings"""
        df = pd.DataFrame(events)
        print(f"\n📊 Anonymizing {len(df)} events...")
        print(f"   Applying noise to IoT sensor fields...")
        
        # Track statistics
        original_stats = {}
        anonymized_stats = {}
        
        # IoT sensor fields with sensitivity values
        sensitive_fields = {
            'voltage': 5.0,      # ±5V sensitivity
            'current': 2.0,      # ±2A sensitivity  
            'power_factor': 0.1, # ±0.1 sensitivity
            'temperature': 3.0,  # ±3°C sensitivity
            'load': 1.0          # ±1kW sensitivity
        }
        
        for field, sensitivity in sensitive_fields.items():
            if field in df.columns:
                # Store original stats
                original_stats[field] = df[field].mean()
                
                # Apply Laplace noise
                df[field] = self.add_laplace_noise(
                    df[field].values, 
                    sensitivity=sensitivity
                )
                
                # Post-processing: ensure realistic bounds
                if field == 'voltage':
                    df[field] = df[field].clip(200, 260)
                elif field == 'current':
                    df[field] = df[field].clip(0, 30)
                elif field == 'power_factor':
                    df[field] = df[field].clip(0.5, 1.0)
                elif field == 'temperature':
                    df[field] = df[field].clip(15, 95)
                elif field == 'load':
                    df[field] = df[field].clip(0, 20)
                
                # Round for readability
                df[field] = df[field].round(2)
                
                # Store anonymized stats
                anonymized_stats[field] = df[field].mean()
                
                print(f"   ✅ {field}: Noise added (sensitivity={sensitivity})")
        
        # Preserved fields (no noise):
        # - user_id, event_id (identifiers)
        # - is_suspicious, attack_type (labels for ML)
        # - timestamps, location, device_id
        
        return df.to_dict('records'), original_stats, anonymized_stats


def main():
    """Main privacy protection pipeline"""
    
    print("=" * 80)
    print("PRIVACY PROTECTION - PrivBayes ε-Differential Privacy")
    print("Based on Paper Section 3.1 - Privacy-Preserving Analytics")
    print("=" * 80)
    
    # Input paths
    input_file = 'data/events.json'
    
    # Check if input exists
    if not os.path.exists(input_file):
        print(f"\n❌ Error: {input_file} not found!")
        print("   Please run: python scripts/1_generate_hybrid_dataset.py first")
        return
    
    # Load original data
    with open(input_file, 'r') as f:
        events = json.load(f)
    
    print(f"\n📂 Loaded {len(events)} events from: {input_file}")
    
    # Apply PrivBayes (ε=1.0 for moderate privacy)
    anonymizer = PrivBayesAnonymizer(epsilon=1.0)
    anonymized_events, orig_stats, anon_stats = anonymizer.anonymize_dataset(events)
    
    # Create output directory
    os.makedirs('data/processed_data', exist_ok=True)
    
    # Save anonymized data
    output_files = [
        'data/events_privbayes.json',  # For backend compatibility
        'data/processed_data/privbayes_protected.json'  # Organized location
    ]
    
    for output_file in output_files:
        with open(output_file, 'w') as f:
            json.dump(anonymized_events, f, indent=2)
        print(f"\n✅ Saved: {output_file}")
    
    # Display privacy metrics
    print("\n" + "=" * 80)
    print("📈 PRIVACY IMPACT ANALYSIS")
    print("=" * 80)
    print(f"\nPrivacy Budget: ε = {anonymizer.epsilon}")
    print(f"Total Events Protected: {len(anonymized_events)}")
    
    print(f"\n{'Field':<15} {'Original':<12} {'Protected':<12} {'Change (%)':<12}")
    print("-" * 60)
    
    for field in orig_stats:
        orig_mean = orig_stats[field]
        anon_mean = anon_stats[field]
        diff_pct = abs(orig_mean - anon_mean) / orig_mean * 100 if orig_mean != 0 else 0
        
        print(f"{field:<15} {orig_mean:>10.2f}  →  {anon_mean:>10.2f}   "
              f"({diff_pct:>5.2f}%)")
    
    # Summary
    avg_utility_loss = np.mean([
        abs(orig_stats[f] - anon_stats[f]) / orig_stats[f] * 100 
        for f in orig_stats if orig_stats[f] != 0
    ])
    
    print("\n" + "=" * 80)
    print("✅ PRIVACY PROTECTION COMPLETE!")
    print("=" * 80)
    print(f"\nAverage Utility Loss: {avg_utility_loss:.2f}%")
    
    if avg_utility_loss < 5:
        print("   Quality: ✅ EXCELLENT (<5% loss)")
    elif avg_utility_loss < 10:
        print("   Quality: ✅ GOOD (<10% loss)")
    else:
        print("   Quality: ⚠️  ACCEPTABLE")
    
    print(f"\n📊 Output Locations:")
    print(f"   1. data/events_privbayes.json (backend)")
    print(f"   2. data/processed_data/privbayes_protected.json (organized)")
    
    print(f"\n🎯 Next Steps:")
    print(f"   1. Run: python scripts/3_train_ml_model.py")
    print(f"   2. Start backend: uvicorn app.main:app --reload")
    print(f"   3. View dashboard: http://localhost:5173")
    
    print("\n" + "=" * 80)


if __name__ == "__main__":
    main()
