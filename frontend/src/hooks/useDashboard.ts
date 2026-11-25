import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { TrafficStats, TrafficHistoryPoint } from '../types/flow';
import { AttackDistributionItem } from '../types/attack';
import { Incident } from '../types/incident';

export function useDashboard() {
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemo, setIsDemo] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<'1H' | '6H' | '24H' | '7D'>('1H');

  const [kpis, setKpis] = useState({
    total_flows: 0,
    known_attacks: 0,
    unknown_threats: 0,
    mitigated: 0,
    active_incidents: 0,
    anomaly_rate: 0,
    controller_status: 'UNKNOWN',
    model_health: 'UNKNOWN',
  });

  const [trafficStats, setTrafficStats] = useState<TrafficStats | null>(null);
  const [trafficHistory, setTrafficHistory] = useState<TrafficHistoryPoint[]>([]);
  const [attackDistribution, setAttackDistribution] = useState<AttackDistributionItem[]>([]);
  const [latestIncident, setLatestIncident] = useState<Incident | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardSummary();
      setKpis(res.kpis);
      setTrafficStats(res.traffic_stats);
      setAttackDistribution(res.attack_distribution);
      setLatestIncident(res.latest_incident);
      setIsDemo(res.is_demo);
    } catch (e) {
      console.error('Failed to load dashboard summary', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async (range: '1H' | '6H' | '24H' | '7D') => {
    try {
      const res = await api.getTrafficHistory(range);
      setTrafficHistory(res.points);
    } catch (e) {
      console.error('Failed to load traffic history', e);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchHistory(timeRange);
  }, [timeRange, fetchHistory]);

  return {
    loading,
    isDemo,
    kpis,
    trafficStats,
    trafficHistory,
    attackDistribution,
    latestIncident,
    timeRange,
    setTimeRange,
    refresh: () => {
      fetchSummary();
      fetchHistory(timeRange);
    },
  };
}
