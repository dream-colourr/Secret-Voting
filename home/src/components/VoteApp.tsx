import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useState } from 'react';
import { ProposalList } from './vote/ProposalList';
import { CreateProposal } from './vote/CreateProposal';
import { ZamaStatus } from './ZamaStatus';

export function VoteApp() {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');

  const headerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '32px 0',
    marginBottom: '40px',
    borderRadius: '0 0 24px 24px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px'
  };

  const headerContentStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: 'white'
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '32px',
    fontWeight: '700',
    letterSpacing: '-0.5px'
  };

  const headerActionsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  };

  const navStyle: React.CSSProperties = {
    display: 'flex',
    gap: '4px',
    marginBottom: '32px',
    background: 'white',
    padding: '8px',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  };

  const getTabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: isConnected || activeTab === 'list' ? 'pointer' : 'not-allowed',
    transition: 'all 0.2s ease',
    background: isActive
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : 'transparent',
    color: isActive ? 'white' : '#6b7280',
    opacity: (!isConnected && activeTab !== 'list' && !isActive) ? 0.5 : 1,
    transform: isActive ? 'translateY(-1px)' : 'none',
    boxShadow: isActive ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
  });

  const contentStyle: React.CSSProperties = {
    minHeight: '400px'
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f8fafc, #e2e8f0)' }}>
      <header style={headerStyle}>
        <div style={containerStyle}>
          <div style={headerContentStyle}>
            <div>
              <h1 style={titleStyle}>🗳️ SecretVote</h1>
              <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '18px' }}>
                Confidential Voting with Zama FHE
              </p>
            </div>
            <div style={headerActionsStyle}>
              <ZamaStatus />
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      <div style={containerStyle}>
        <nav style={navStyle}>
          <button
            onClick={() => setActiveTab('list')}
            style={getTabStyle(activeTab === 'list')}
          >
            📋 View Proposals
          </button>
          <button
            onClick={() => setActiveTab('create')}
            style={getTabStyle(activeTab === 'create')}
            disabled={!isConnected}
          >
            ✨ Create Proposal
          </button>
        </nav>

        <div style={contentStyle}>
          {activeTab === 'list' && <ProposalList />}
          {activeTab === 'create' && <CreateProposal />}
        </div>
      </div>
    </div>
  );
}
