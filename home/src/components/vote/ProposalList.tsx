import { useEffect, useState } from 'react';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { SECRET_VOTE_ABI, SECRET_VOTE_ADDRESS } from '../../config/contract';
import { ProposalDetail } from './ProposalDetail';

const client = createPublicClient({ chain: sepolia, transport: http() });

type Meta = {
  title: string;
  options: readonly string[];
  startTime: bigint;
  endTime: bigint;
  finalized: boolean;
  pending: boolean;
  voters: number;
};

export function ProposalList() {
  const [count, setCount] = useState<number>(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [metas, setMetas] = useState<Record<number, Meta>>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const total = (await client.readContract({
          address: SECRET_VOTE_ADDRESS as `0x${string}`,
          abi: SECRET_VOTE_ABI,
          functionName: 'getProposalCount',
          args: [],
        })) as bigint;
        if (!mounted) return;
        setCount(Number(total));
        const metas: Record<number, Meta> = {};
        for (let i = 0; i < Number(total); i++) {
          const res = (await client.readContract({
            address: SECRET_VOTE_ADDRESS as `0x${string}`,
            abi: SECRET_VOTE_ABI,
            functionName: 'getProposal',
            args: [BigInt(i)],
          })) as readonly [string, readonly string[], bigint, bigint, boolean, boolean];
          const voters = (await client.readContract({
            address: SECRET_VOTE_ADDRESS as `0x${string}`,
            abi: SECRET_VOTE_ABI,
            functionName: 'getVoterCount',
            args: [BigInt(i)],
          })) as bigint;
          metas[i] = {
            title: res[0],
            options: res[1],
            startTime: res[2],
            endTime: res[3],
            finalized: res[4],
            pending: res[5],
            voters: Number(voters),
          };
        }
        if (!mounted) return;
        setMetas(metas);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (selected != null) {
    return <ProposalDetail id={selected} meta={metas[selected]!} onBack={() => setSelected(null)} />;
  }

  const loadingStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  };

  const emptyStateStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    color: '#6b7280'
  };

  const proposalCardStyle: React.CSSProperties = {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '24px',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
  };

  const proposalCardHoverStyle: React.CSSProperties = {
    ...proposalCardStyle,
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    borderColor: '#d1d5db'
  };

  const getStatusBadge = (meta: Meta) => {
    const now = Date.now() / 1000;
    const startTime = Number(meta.startTime);
    const endTime = Number(meta.endTime);

    let status = '';
    let color = '';
    let bgColor = '';

    if (meta.finalized) {
      status = '✅ Finalized';
      color = '#059669';
      bgColor = '#d1fae5';
    } else if (now < startTime) {
      status = '⏳ Pending';
      color = '#d97706';
      bgColor = '#fef3c7';
    } else if (now >= startTime && now <= endTime) {
      status = '🗳️ Active';
      color = '#dc2626';
      bgColor = '#fee2e2';
    } else {
      status = '⏰ Ended';
      color = '#6b7280';
      bgColor = '#f3f4f6';
    }

    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
        color,
        backgroundColor: bgColor
      }}>
        {status}
      </span>
    );
  };

  return (
    <div>
      {loading && (
        <div style={loadingStyle}>
          <div>
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>🔄 Loading proposals...</div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Please wait while we fetch the data</div>
          </div>
        </div>
      )}

      {!loading && count === 0 && (
        <div style={emptyStateStyle}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>No proposals yet</div>
          <div style={{ fontSize: '16px' }}>Create the first proposal to get started with voting</div>
        </div>
      )}

      {!loading && count > 0 && (
        <div style={{ display: 'grid', gap: '20px' }}>
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              style={proposalCardStyle}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, proposalCardHoverStyle);
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, proposalCardStyle);
              }}
              onClick={() => setSelected(i)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1f2937',
                    lineHeight: '1.4'
                  }}>
                    {metas[i]?.title ?? 'Loading...'}
                  </h3>
                  {metas[i] && getStatusBadge(metas[i])}
                </div>
                <button
                  className="btn-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(i);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  View Details
                </button>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '16px',
                color: '#6b7280',
                fontSize: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📝</span>
                  <span>{metas[i]?.options?.length ?? 0} Options</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>👥</span>
                  <span>{metas[i]?.voters ?? 0} Voters</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>⏰</span>
                  <span>
                    Ends: {metas[i]?.endTime
                      ? new Date(Number(metas[i].endTime) * 1000).toLocaleDateString()
                      : 'Loading...'
                    }
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
