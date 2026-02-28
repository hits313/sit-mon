import { Shield, Anchor, Plane, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TheaterProps {
  name: string;
  status: 'CRITICAL' | 'ELEVATED' | 'WATCH' | 'STABLE' | 'HIGH';
  trend?: 'ESCALATING' | 'STABLE' | 'VOLATILE' | 'IMPROVING';
  assets: {
    air: number;
    naval: number;
    ground: string | number;
  };
}

export default function TheaterCard({ name, status, trend, assets }: TheaterProps) {
  const getStatusColor = (s: string) => {
    switch (s) {
      case 'CRITICAL': return 'text-[var(--color-ops-alert)] border-[var(--color-ops-alert)] bg-[var(--color-ops-alert)]/10';
      case 'HIGH': return 'text-[var(--color-ops-alert)] border-[var(--color-ops-alert)] bg-[var(--color-ops-alert)]/10';
      case 'ELEVATED': return 'text-[var(--color-ops-warning)] border-[var(--color-ops-warning)] bg-[var(--color-ops-warning)]/10';
      case 'VOLATILE': return 'text-[var(--color-ops-warning)] border-[var(--color-ops-warning)] bg-[var(--color-ops-warning)]/10';
      case 'WATCH': return 'text-[var(--color-ops-info)] border-[var(--color-ops-info)] bg-[var(--color-ops-info)]/10';
      default: return 'text-[var(--color-ops-success)] border-[var(--color-ops-success)] bg-[var(--color-ops-success)]/10';
    }
  };

  const getTrendIcon = (t?: string) => {
    switch (t) {
      case 'ESCALATING': return <TrendingUp className="h-3 w-3 text-[var(--color-ops-alert)]" />;
      case 'VOLATILE': return <TrendingUp className="h-3 w-3 text-[var(--color-ops-warning)]" />;
      case 'IMPROVING': return <TrendingDown className="h-3 w-3 text-[var(--color-ops-success)]" />;
      default: return <Minus className="h-3 w-3 text-[var(--color-ops-text-secondary)]" />;
    }
  };

  return (
    <div className="border border-[var(--color-ops-border)] bg-[var(--color-ops-bg)] p-3 mb-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold tracking-wider text-[var(--color-ops-text-primary)]">{name}</span>
        <span className={`px-1.5 py-0.5 text-[9px] font-bold border rounded ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>
      
      {trend && (
        <div className="flex items-center gap-1 mb-3 text-[10px] text-[var(--color-ops-text-secondary)]">
          <span>TREND:</span>
          <span className="text-[var(--color-ops-text-primary)] font-bold">{trend}</span>
          {getTrendIcon(trend)}
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-[var(--color-ops-surface)] p-1.5 rounded border border-[var(--color-ops-border)] flex flex-col items-center gap-1">
          <Plane className="h-3 w-3 text-[var(--color-ops-text-secondary)]" />
          <div className="text-sm font-bold font-mono text-[var(--color-ops-text-primary)]">{assets.air}</div>
        </div>
        <div className="bg-[var(--color-ops-surface)] p-1.5 rounded border border-[var(--color-ops-border)] flex flex-col items-center gap-1">
          <Anchor className="h-3 w-3 text-[var(--color-ops-text-secondary)]" />
          <div className="text-sm font-bold font-mono text-[var(--color-ops-text-primary)]">{assets.naval}</div>
        </div>
        <div className="bg-[var(--color-ops-surface)] p-1.5 rounded border border-[var(--color-ops-border)] flex flex-col items-center gap-1">
          <Shield className="h-3 w-3 text-[var(--color-ops-text-secondary)]" />
          <div className="text-sm font-bold font-mono text-[var(--color-ops-text-primary)]">{assets.ground}</div>
        </div>
      </div>
    </div>
  );
}
