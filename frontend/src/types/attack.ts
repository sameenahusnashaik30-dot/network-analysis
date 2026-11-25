export type AttackCategory =
  | 'Normal'
  | 'DDoS'
  | 'DoS'
  | 'Port Scan'
  | 'Brute Force'
  | 'Botnet'
  | 'Web Attack'
  | 'Unknown Attack'
  | 'Zero-Day Candidate';

export interface AttackDistributionItem {
  name: AttackCategory;
  count: number;
  percentage: number;
  color: string;
}

export interface KnownAttackModelConfig {
  model_type: 'Random Forest' | 'XGBoost';
  dataset: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  classes: string[];
}
