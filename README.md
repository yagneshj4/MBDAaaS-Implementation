Smart Grid Security Analytics
Real-time Threat Detection Dashboard - MBDAaaS Implementation

🚀 Overview
Smart Grid Security Analytics is a full-stack analytics platform for detection of cyber-physical threats in smart grid environments. The system leverages a hybrid dataset (IoT Smart Grid + UNSW-NB15 Cybersecurity), differential privacy with PrivBayes, and a trained ML model (Random Forest) for precise anomaly and intrusion detection. Dashboard is built with React + Chakra UI; backend with FastAPI.

✨ Features
Hybrid Dataset: Smart Grid sensor data combined with network intrusion records (UNSW-NB15)
Real-Time Dashboard: Live monitoring, anomaly count, event analytics
ML-Based Threat Detection: Random Forest classifier, confusion matrix, ROC curve
Privacy Preservation: Differential privacy via PrivBayes (ε-DP)
Nosy Admin Detection: Identifies unauthorized admin reads (Paper §3.2)
Dormant Account Monitoring: Detects inactive accounts with risk
Live Export & Filtering: Download CSV, print/PDF, filter by attack or threat level
Modern Frontend: React + Chakra UI with dynamic charts

🖥️ Tech Stack
Backend: Python, FastAPI, Pandas, Scikit-learn
Frontend: React, TypeScript, Chakra UI
ML Model: Random Forest
Privacy: PrivBayes-inspired DP
Data: IIoT Smart Grid + UNSW-NB15

📊 How It Works
Hybrid Data Pipeline: Combines real IIoT sensor data with cybersecurity attack events
Privacy Protection: PrivBayes applies ε-differential privacy to event logs
Training: ML pipeline fits Random Forest classifier (100% test accuracy)
API Server: FastAPI exposes endpoints for predictions and data export
Dashboard UI: Visualizes events, system health, ML metrics, threat patterns live

📈 Sample Dashboard UI
Hybrid Data Sources (IoT + Cybersecurity)
Total Events, Anomalies, Accuracy cards
Confusion Matrix & ROC Curve
Nosy Admin" & Dormant Account alerts
Export/Filter tools

📚 References
Based on “Big Data Analytics-as-a-Service” (Ardagna et al., 2021)
UNSW-NB15 dataset 
