import os
import csv
import json
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from app.ml.preprocessing import extract_features, FEATURE_NAMES

ATTACK_CLASSES = [
    "Normal",
    "DDoS",
    "DoS",
    "Port Scan",
    "Brute Force",
    "Botnet",
    "Web Attack",
]

def generate_synthetic_flow_dataset(samples_per_class: int = 1000, random_state: int = 42):
    np.random.seed(random_state)
    records = []

    for label in ATTACK_CLASSES:
        for i in range(samples_per_class):
            if label == "Normal":
                pkt_cnt = int(np.random.normal(2500, 800))
                duration = max(1.0, float(np.random.normal(30.0, 10.0)))
                byte_cnt = int(pkt_cnt * np.random.uniform(60, 120))
                dst_port = int(np.random.choice([80, 443, 8080, 53]))
                src_port = int(np.random.randint(40000, 65000))
                flags = np.random.choice(["ACK", "PSH,ACK", "SYN,ACK"], p=[0.7, 0.25, 0.05])
            elif label == "DDoS":
                duration = max(0.5, float(np.random.normal(4.0, 1.5)))
                pkt_cnt = int(np.random.normal(180000, 30000))
                byte_cnt = int(pkt_cnt * np.random.uniform(60, 80))
                dst_port = int(np.random.choice([80, 443]))
                src_port = int(np.random.randint(1024, 65000))
                flags = "SYN"
            elif label == "DoS":
                duration = max(1.0, float(np.random.normal(15.0, 5.0)))
                pkt_cnt = int(np.random.normal(45000, 10000))
                byte_cnt = int(pkt_cnt * np.random.uniform(50, 70))
                dst_port = int(np.random.choice([80, 443, 8080]))
                src_port = int(np.random.randint(20000, 60000))
                flags = np.random.choice(["SYN", "RST"], p=[0.8, 0.2])
            elif label == "Port Scan":
                duration = max(0.1, float(np.random.exponential(1.5)))
                pkt_cnt = int(np.random.randint(1, 15))
                byte_cnt = int(pkt_cnt * np.random.uniform(40, 60))
                dst_port = int(np.random.randint(1, 10000))
                src_port = int(np.random.randint(30000, 65000))
                flags = np.random.choice(["SYN", "FIN", "RST"], p=[0.7, 0.2, 0.1])
            elif label == "Brute Force":
                duration = max(5.0, float(np.random.normal(45.0, 15.0)))
                pkt_cnt = int(np.random.normal(1200, 300))
                byte_cnt = int(pkt_cnt * np.random.uniform(100, 250))
                dst_port = int(np.random.choice([22, 3389, 21, 23]))
                src_port = int(np.random.randint(40000, 60000))
                flags = "PSH,ACK"
            elif label == "Botnet":
                duration = max(2.0, float(np.random.normal(60.0, 20.0)))
                pkt_cnt = int(np.random.normal(5000, 1200))
                byte_cnt = int(pkt_cnt * np.random.uniform(80, 150))
                dst_port = int(np.random.choice([6667, 8000, 4444, 1337]))
                src_port = int(np.random.randint(1024, 65000))
                flags = np.random.choice(["ACK", "SYN,ACK"], p=[0.8, 0.2])
            elif label == "Web Attack":
                duration = max(2.0, float(np.random.normal(18.0, 6.0)))
                pkt_cnt = int(np.random.normal(3500, 800))
                byte_cnt = int(pkt_cnt * np.random.uniform(250, 600))
                dst_port = int(np.random.choice([80, 443, 8080, 8443]))
                src_port = int(np.random.randint(30000, 65000))
                flags = "PSH,ACK"

            pkt_cnt = max(1, pkt_cnt)
            byte_cnt = max(40, byte_cnt)
            pkt_rate = pkt_cnt / duration
            byte_rate = byte_cnt / duration

            flow = {
                "flow_id": f"GEN-{label[:3].upper()}-{i:04d}",
                "packet_count": pkt_cnt,
                "byte_count": byte_cnt,
                "duration_sec": round(duration, 2),
                "packet_rate": round(pkt_rate, 2),
                "byte_rate": round(byte_rate, 2),
                "dst_port": dst_port,
                "src_port": src_port,
                "tcp_flags": flags,
                "label": label,
            }
            records.append(flow)

    return records

def main():
    print("=" * 70)
    print("  SENTINEL-X MODEL TRAINING & CALIBRATION PIPELINE")
    print("=" * 70)

    os.makedirs("models", exist_ok=True)
    os.makedirs("../data/processed", exist_ok=True)
    os.makedirs("../data/sample", exist_ok=True)

    print("\n[1/4] Generating benchmark SDN flow dataset (7,000 samples across 7 classes)...")
    records = generate_synthetic_flow_dataset(samples_per_class=1000, random_state=42)
    
    # Write to CSV
    keys = list(records[0].keys())
    with open("../data/processed/flows_dataset.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        writer.writerows(records)

    # Save a small sample
    with open("../data/sample/network_flows_sample.json", "w", encoding="utf-8") as f:
        json.dump(records[:50], f, indent=2)
    print(f"      Saved dataset to ../data/processed/flows_dataset.csv ({len(records)} rows)")

    # Extract standardized feature matrix X
    print("\n[2/4] Standardizing feature vectors...")
    X = np.array([extract_features(r) for r in records])
    y = np.array([r["label"] for r in records])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

    print("\n[3/4] Training Multi-Class Known Attack Classifier (RandomForest)...")
    clf = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1)
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"      Validation Accuracy: {acc * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, digits=4))

    clf_payload = {
        "model": clf,
        "classes": list(clf.classes_),
        "feature_names": FEATURE_NAMES,
        "accuracy": acc,
    }
    joblib.dump(clf_payload, "models/known_attack_classifier.joblib")
    print("      Model saved to models/known_attack_classifier.joblib")

    print("\n[4/4] Training Deep Autoencoder Anomaly Detector on Normal Baseline Traffic...")
    normal_mask = (y_train == "Normal")
    X_normal_train = X_train[normal_mask]
    
    autoencoder = MLPRegressor(
        hidden_layer_sizes=(8, 4, 8),
        activation="tanh",
        solver="adam",
        max_iter=300,
        random_state=42,
        early_stopping=True,
    )
    autoencoder.fit(X_normal_train, X_normal_train)

    # Evaluate reconstruction error distribution on normal vs attack test data
    X_normal_test = X_test[y_test == "Normal"]
    X_attack_test = X_test[y_test != "Normal"]

    recon_normal = np.mean((X_normal_test - autoencoder.predict(X_normal_test)) ** 2, axis=1)
    recon_attack = np.mean((X_attack_test - autoencoder.predict(X_attack_test)) ** 2, axis=1)

    normal_mean_err = float(np.mean(recon_normal))
    attack_mean_err = float(np.mean(recon_attack))
    threshold = float(np.percentile(recon_normal, 95))

    print(f"      Normal Traffic Mean Reconstruction Error: {normal_mean_err:.4f}")
    print(f"      Attack Traffic Mean Reconstruction Error: {attack_mean_err:.4f}")
    print(f"      Calibrated Anomaly Threshold (95th percentile normal): {threshold:.4f}")

    autoencoder_payload = {
        "model": autoencoder,
        "threshold": threshold,
        "normal_mean_err": normal_mean_err,
        "feature_names": FEATURE_NAMES,
    }
    joblib.dump(autoencoder_payload, "models/autoencoder_anomaly.joblib")
    print("      Model saved to models/autoencoder_anomaly.joblib")

    print("\n" + "=" * 70)
    print("  ALL MODELS SUCCESSFULLY TRAINED, CALIBRATED & SAVED TO DISK")
    print("=" * 70)

if __name__ == "__main__":
    main()
