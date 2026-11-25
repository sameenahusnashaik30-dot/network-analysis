export interface FeatureContribution {
  feature_name: string;
  contribution: number;
  feature_value: string | number;
  is_positive: boolean; // pushes towards attack classification
}

export interface ShapExplanation {
  incident_id: string;
  base_value: number;
  prediction_score: number;
  target_class: string;
  features: FeatureContribution[];
  summary: string;
}

export interface LimeExplanation {
  incident_id: string;
  intercept: number;
  prediction_score: number;
  target_class: string;
  reasons: {
    rule: string;
    weight: number;
    description: string;
  }[];
  explanation_text: string;
}

export interface ExplanationReliabilityResult {
  stability_score: number; // 0-100%
  feature_ranking_consistency: number; // 0.0 - 1.0 (Spearman rho)
  perturbation_test_result: string;
  tested_features_count: number;
  perturbation_sigma: number;
  top_features_retained: string[];
}
