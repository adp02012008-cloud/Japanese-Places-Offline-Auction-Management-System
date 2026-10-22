'use client';

import React, { useEffect, useState } from 'react';
import { History, ShieldCheck, RefreshCw, FileText, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IAuditLog } from '@/types';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<IAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/audit?limit=100');
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
            <History className="h-6 w-6 text-kiniro-400" />
            <span>Audit Trail & Security Logs</span>
          </h2>
          <p className="text-sm text-sumi-400">
            Immutable log of sales confirmations, budget modifications, cancellations, and valuations.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchLogs}
          disabled={loading}
          className="border-sumi-700 hover:bg-sumi-800 text-sumi-200"
        >
          <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Logs
        </Button>
      </div>

      <Card className="border-sumi-800 bg-sumi-900/80 overflow-hidden shadow-sumi-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-sumi-950 border-b border-sumi-800 text-sumi-400 font-serif text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Action Type</th>
                <th className="px-5 py-3.5">Administrator</th>
                <th className="px-5 py-3.5">Affected Entity</th>
                <th className="px-5 py-3.5">Reason / Description</th>
                <th className="px-5 py-3.5">Snapshot (Before / After)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sumi-800/60 font-sans text-xs">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sumi-400">
                    {loading ? 'Loading audit trail...' : 'No audit records logged yet.'}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-sumi-800/40 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap text-sumi-400 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="px-5 py-3.5">
                      <Badge
                        variant={
                          log.actionType.includes('CONFIRM')
                            ? 'available'
                            : log.actionType.includes('CANCEL')
                            ? 'sold'
                            : log.actionType.includes('SETTING')
                            ? 'gold'
                            : 'outline'
                        }
                        className="text-[10px]"
                      >
                        {log.actionType}
                      </Badge>
                    </td>

                    <td className="px-5 py-3.5 font-medium text-white">
                      {log.adminUsername}
                    </td>

                    <td className="px-5 py-3.5 text-sumi-300">
                      <span className="font-mono text-[11px] bg-sumi-950 px-1.5 py-0.5 rounded border border-sumi-800">
                        {log.affectedRecordType}#{log.affectedRecordId.slice(-6)}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-sumi-300 max-w-xs truncate">
                      {log.reason || 'N/A'}
                    </td>

                    <td className="px-5 py-3.5 max-w-xs text-[11px] text-sumi-400">
                      {log.afterValue ? (
                        <div className="font-mono text-[10px] bg-sumi-950 p-1.5 rounded border border-sumi-800/80 truncate">
                          {JSON.stringify(log.afterValue)}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
