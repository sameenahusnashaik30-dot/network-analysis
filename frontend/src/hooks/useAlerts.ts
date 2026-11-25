import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Incident } from '../types/incident';

export function useAlerts() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemo, setIsDemo] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getIncidents();
      setIncidents(res.incidents);
      setIsDemo(res.is_demo);
    } catch (e) {
      console.error('Failed to load incidents', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      search === '' ||
      inc.incident_id.toLowerCase().includes(search.toLowerCase()) ||
      inc.src_ip.includes(search) ||
      inc.dst_ip.includes(search) ||
      inc.classification.toLowerCase().includes(search.toLowerCase());

    const matchesSeverity = severityFilter === 'ALL' || inc.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return {
    incidents: filteredIncidents,
    allIncidents: incidents,
    loading,
    isDemo,
    search,
    setSearch,
    severityFilter,
    setSeverityFilter,
    statusFilter,
    setStatusFilter,
    refresh: fetchIncidents,
  };
}
