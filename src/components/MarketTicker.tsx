import { useMarkets } from '../hooks/useMarkets';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MarketTicker() {
  const { markets } = useMarkets();

  return (
    <div className="flex flex-col h-full border-t border-[var(--color-ops-border)] bg-[var(--color-ops-surface)]">
      <div className="p-3 border-b border-[var(--color-ops-border)]">
        <span className="text-xs font-bold text-[var(--color-ops-text-secondary)]">GLOBAL MARKETS</span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {markets.map((market) => (
          <div key={market.symbol} className="bg-[var(--color-ops-bg)] border border-[var(--color-ops-border)] p-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold">{market.symbol}</span>
              <div className={`flex items-center gap-1 text-xs font-mono ${market.change >= 0 ? 'text-[var(--color-ops-info)]' : 'text-[var(--color-ops-alert)]'}`}>
                {market.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {market.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="h-8 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={market.history.map((p, i) => ({ value: p, index: i }))}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={market.change >= 0 ? 'var(--color-ops-info)' : 'var(--color-ops-alert)'} 
                    strokeWidth={1.5} 
                    dot={false} 
                    isAnimationActive={false}
                  />
                  <YAxis domain={['dataMin', 'dataMax']} hide />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
