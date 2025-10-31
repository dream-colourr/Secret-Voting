import { useEffect, useState } from 'react';
import { Contract } from 'ethers';
import { SECRET_VOTE_ABI, SECRET_VOTE_ADDRESS } from '../../config/contract';
import { useEthersSigner } from '../../hooks/useEthersSigner';

declare global {
  interface Window { ethereum?: any }
}

export function CreateProposal() {
  const [title, setTitle] = useState('');
  const [opts, setOpts] = useState<string[]>(['', '']);
  const [startLocal, setStartLocal] = useState<string>('');
  const [endLocal, setEndLocal] = useState<string>('');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const addOption = () => setOpts((o) => [...o, '']);
  const updateOption = (i: number, v: string) => setOpts((o) => o.map((x, idx) => (idx === i ? v : x)));
  const removeOption = (i: number) => setOpts((o) => o.filter((_, idx) => idx !== i));

  // Initialize default time: start = now + 5 min, end = start + 1 hour
  useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const toLocalInput = (d: Date) => {
      const y = d.getFullYear();
      const m = pad(d.getMonth() + 1);
      const day = pad(d.getDate());
      const h = pad(d.getHours());
      const min = pad(d.getMinutes());
      return `${y}-${m}-${day}T${h}:${min}`;
    };
    const now = new Date();
    const startD = new Date(now.getTime() + 5 * 60 * 1000);
    const endD = new Date(startD.getTime() + 60 * 60 * 1000);
    setStartLocal(toLocalInput(startD));
    setEndLocal(toLocalInput(endD));
  }, []);

  const toUnix = (local: string): bigint => {
    const ms = new Date(local).getTime();
    return BigInt(Math.floor(ms / 1000));
  };

  const signerPromise = useEthersSigner();

  const submit = async () => {
    setError(null);
    setTxHash(null);
    try {
      const signer = await signerPromise;
      if (!signer) throw new Error('Connect wallet');
      if (!title.trim()) throw new Error('Title required');
      const options = opts.map((s: string) => s.trim()).filter(Boolean);
      if (options.length < 2) throw new Error('At least 2 options');
      if (!startLocal || !endLocal) throw new Error('Start/end required');
      const startTs = toUnix(startLocal);
      const endTs = toUnix(endLocal);

      setSending(true);
      const c = new Contract(SECRET_VOTE_ADDRESS, SECRET_VOTE_ABI, signer);
      const tx = await c.createProposal(title, options, startTs, endTs);
      setTxHash(tx.hash);
      await tx.wait();
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setSending(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    maxWidth: '600px',
    margin: '0 auto'
  };

  const headerStyle: React.CSSProperties = {
    margin: '0 0 32px 0',
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '20px'
  };

  const labelTextStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit'
  };

  const inputFocusStyle: React.CSSProperties = {
    ...inputStyle,
    borderColor: '#667eea',
    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
    outline: 'none'
  };

  const optionRowStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginBottom: '12px'
  };

  const removeButtonStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: '2px solid #f87171',
    borderRadius: '8px',
    background: 'white',
    color: '#dc2626',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    minWidth: '40px'
  };

  const addButtonStyle: React.CSSProperties = {
    padding: '12px 20px',
    border: '2px dashed #9ca3af',
    borderRadius: '8px',
    background: 'transparent',
    color: '#6b7280',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '16px',
    transition: 'all 0.2s ease',
    width: '100%',
    marginTop: '8px'
  };

  const submitButtonStyle: React.CSSProperties = {
    background: sending
      ? '#9ca3af'
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '16px 32px',
    fontSize: '18px',
    fontWeight: '700',
    cursor: sending ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    width: '100%',
    marginTop: '24px',
    boxShadow: sending ? 'none' : '0 4px 16px rgba(102, 126, 234, 0.3)'
  };

  const successStyle: React.CSSProperties = {
    background: '#d1fae5',
    color: '#065f46',
    padding: '16px',
    borderRadius: '8px',
    marginTop: '16px',
    textAlign: 'center',
    fontWeight: '600',
    border: '2px solid #a7f3d0'
  };

  const errorStyle: React.CSSProperties = {
    background: '#fee2e2',
    color: '#991b1b',
    padding: '16px',
    borderRadius: '8px',
    marginTop: '16px',
    textAlign: 'center',
    fontWeight: '600',
    border: '2px solid #fca5a5'
  };

  const loadingStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginTop: '16px',
    color: '#6b7280',
    fontSize: '16px'
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>✨ Create New Proposal</h2>

      <div style={{ display: 'grid', gap: '24px' }}>
        <label style={labelStyle}>
          <span style={labelTextStyle}>📝 Proposal Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
            onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
            onBlur={(e) => Object.assign(e.target.style, inputStyle)}
            placeholder="Enter a clear and descriptive title"
          />
        </label>

        <div>
          <span style={labelTextStyle}>📋 Voting Options</span>
          <div style={{ marginTop: '12px' }}>
            {opts.map((o: string, i: number) => (
              <div key={i} style={optionRowStyle}>
                <input
                  value={o}
                  onChange={(e) => updateOption(i, e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                  placeholder={`Option ${i + 1}`}
                />
                {opts.length > 2 && (
                  <button
                    onClick={() => removeOption(i)}
                    style={removeButtonStyle}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    aria-label="Remove option"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addOption}
              style={addButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.color = '#667eea';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#9ca3af';
                e.currentTarget.style.color = '#6b7280';
              }}
            >
              + Add Another Option
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
          <label style={labelStyle}>
            <span style={labelTextStyle}>🕐 Start Time</span>
            <input
              type="datetime-local"
              value={startLocal}
              onChange={(e) => setStartLocal(e.target.value)}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={(e) => Object.assign(e.target.style, inputStyle)}
            />
          </label>

          <label style={labelStyle}>
            <span style={labelTextStyle}>🕐 End Time</span>
            <input
              type="datetime-local"
              value={endLocal}
              onChange={(e) => setEndLocal(e.target.value)}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={(e) => Object.assign(e.target.style, inputStyle)}
            />
          </label>
        </div>

        <button
          onClick={submit}
          disabled={sending}
          style={submitButtonStyle}
          onMouseEnter={(e) => {
            if (!sending) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!sending) {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.3)';
            }
          }}
        >
          {sending ? 'Creating Proposal...' : '🚀 Create Proposal'}
        </button>

        {sending && (
          <div style={loadingStyle}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid #e5e7eb',
              borderTop: '2px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span>Processing transaction on blockchain...</span>
          </div>
        )}

        {txHash && (
          <div style={successStyle}>
            ✅ Proposal created successfully!<br />
            <small style={{ opacity: 0.8 }}>Transaction: {txHash.slice(0, 10)}...{txHash.slice(-8)}</small>
          </div>
        )}

        {error && (
          <div style={errorStyle}>
            ❌ {error}
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
