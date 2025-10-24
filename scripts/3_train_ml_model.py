import pandas as pd
import numpy as np
import json
import joblib
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score


def main():
    """ML Model Training Pipeline"""
    
    print("=" * 80)
    print("ML MODEL TRAINING - Random Forest Classifier")
    print("Based on Paper Section 5 - Machine Learning Evaluation")
    print("=" * 80)
    
    # Load dataset
    events_file = 'data/events.json'
    
    if not os.path.exists(events_file):
        print(f"\n❌ Error: {events_file} not found!")
        print("   Please run: python scripts/1_generate_hybrid_dataset.py first")
        return
    
    with open(events_file, 'r') as f:
        events = json.load(f)
    
    print(f"\n📂 Loaded {len(events)} events from: {events_file}")
    
    # Convert to DataFrame
    df = pd.DataFrame(events)
    
    # Count normal vs suspicious
    normal_count = len(df[df['is_suspicious'] == False])
    suspicious_count = len(df[df['is_suspicious'] == True])
    
    print(f"   ├── Normal events: {normal_count}")
    print(f"   └── Suspicious events: {suspicious_count}")
    
    # Feature engineering
    print("\n🔧 Feature Engineering...")
    
    # Initialize label encoders
    label_encoders = {}
    
    # Encode categorical features
    categorical_features = ['user_id', 'action', 'table_name']
    
    for feature in categorical_features:
        le = LabelEncoder()
        df[f'{feature}_encoded'] = le.fit_transform(df[feature])
        label_encoders[feature] = le
        print(f"   ✅ Encoded: {feature} ({len(le.classes_)} unique values)")
    
    # Extract temporal features
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df['hour'] = df['timestamp'].dt.hour
    df['day_of_week'] = df['timestamp'].dt.dayofweek
    
    # Binary features
    df['is_admin_action'] = (df['action'].str.contains('ADMIN')).astype(int)
    df['is_sensitive_table'] = df['table_name'].isin([
        'billing_records', 'customer_pii', 'payment_info', 
        'scada_control', 'admin_logs', 'network_config', 'meter_credentials'
    ]).astype(int)
    
    # Define features for ML
    feature_names = [
        'user_id_encoded',
        'action_encoded', 
        'table_name_encoded',
        'hour',
        'day_of_week',
        'is_admin_action',
        'is_sensitive_table'
    ]
    
    print(f"\n📊 Features Selected: {len(feature_names)}")
    for i, feat in enumerate(feature_names, 1):
        print(f"   {i}. {feat}")
    
    # Prepare data
    X = df[feature_names]
    y = df['is_suspicious'].astype(int)
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"\n📈 Dataset Split:")
    print(f"   ├── Training: {len(X_train)} events ({len(X_train)/len(X)*100:.1f}%)")
    print(f"   └── Testing: {len(X_test)} events ({len(X_test)/len(X)*100:.1f}%)")
    
    # Train Random Forest
    print(f"\n🤖 Training Random Forest Classifier...")
    
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_train, y_train)
    
    print(f"   ✅ Model trained successfully!")
    
    # Predictions
    y_pred = model.predict(X_test)
    
    # Evaluation
    accuracy = accuracy_score(y_test, y_pred)
    
    print("\n" + "=" * 80)
    print("📊 MODEL PERFORMANCE")
    print("=" * 80)
    
    print(f"\nOverall Accuracy: {accuracy*100:.2f}%\n")
    
    # Classification report
    print("Classification Report:")
    print("-" * 60)
    report = classification_report(
        y_test, y_pred, 
        target_names=['Normal', 'Suspicious'],
        digits=3
    )
    print(report)
    
    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    print("\nConfusion Matrix:")
    print("-" * 60)
    print(f"                 Predicted Normal  Predicted Suspicious")
    print(f"Actual Normal         {cm[0][0]:>6}           {cm[0][1]:>6}")
    print(f"Actual Suspicious     {cm[1][0]:>6}           {cm[1][1]:>6}")
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': feature_names,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\n🎯 Feature Importance:")
    print("-" * 60)
    for idx, row in feature_importance.iterrows():
        bar_length = int(row['importance'] * 50)
        bar = '█' * bar_length
        print(f"{row['feature']:<25} {bar} {row['importance']:.4f}")
    
    # Save models
    print("\n💾 Saving Models...")
    os.makedirs('models', exist_ok=True)
    
    model_files = {
        'models/random_forest_model.pkl': model,
        'models/label_encoders.pkl': label_encoders,
        'models/feature_names.pkl': feature_names
    }
    
    for filepath, obj in model_files.items():
        joblib.dump(obj, filepath)
        print(f"   ✅ Saved: {filepath}")
    
    # Summary
    print("\n" + "=" * 80)
    print("✅ ML MODEL TRAINING COMPLETE!")
    print("=" * 80)
    
    print(f"\nModel Performance:")
    print(f"   ├── Accuracy: {accuracy*100:.2f}%")
    print(f"   ├── True Positives: {cm[1][1]}")
    print(f"   ├── False Positives: {cm[0][1]}")
    print(f"   └── False Negatives: {cm[1][0]}")
    
    print(f"\nModel Files:")
    print(f"   ├── Random Forest: models/random_forest_model.pkl")
    print(f"   ├── Encoders: models/label_encoders.pkl")
    print(f"   └── Features: models/feature_names.pkl")
    
    print(f"\n🎯 Next Steps:")
    print(f"   1. Start Backend:")
    print(f"      cd backend")
    print(f"      venv\\Scripts\\activate")
    print(f"      uvicorn app.main:app --reload --host 127.0.0.1 --port 8000")
    print(f"\n   2. Start Frontend (new terminal):")
    print(f"      cd frontend")
    print(f"      npm run dev")
    print(f"\n   3. Open Dashboard:")
    print(f"      http://localhost:5173")
    
    print("\n" + "=" * 80)


if __name__ == "__main__":
    main()
