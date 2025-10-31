import { useEffect, useMemo, useState } from 'react';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { Contract } from 'ethers';
import { useZamaInstance } from '../../hooks/useZamaInstance';
import { useEthersSigner } from '../../hooks/useEthersSigner';
import { SECRET_VOTE_ABI, SECRET_VOTE_ADDRESS } from '../../config/contract';

const client = createPublicClient({ chain: sepolia, transport: http() });

export function ProposalDetail({ id, meta, onBack }: { id: number; meta: any; onBack: () => void }) {
  const [counts, setCounts] = useState<number[] | null>(null);
  const [voters, setVoters] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { instance, isLoading: zamaLoading, error: zamaError } = useZamaInstance();
  const signerPromise = useEthersSigner();

  const canVote = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    return now >= Number(meta.startTime) && now <= Number(meta.endTime) && !meta.finalized;
  }, [meta]);

  const canFinalize = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    return now > Number(meta.endTime) && !meta.finalized && !meta.pending;
  }, [meta]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // If finalized, read the clear results
        if (meta.finalized) {
          const res = (await client.readContract({
            address: SECRET_VOTE_ADDRESS as `0x${string}`,
            abi: SECRET_VOTE_ABI,
            functionName: 'getResults',
            args: [BigInt(id)],
          })) as readonly (bigint | number)[];
          if (!mounted) return;
          setCounts(Array.from(res).map((x) => Number(x)));
        } else {
          setCounts(null);
        }
        const vc = (await client.readContract({
          address: SECRET_VOTE_ADDRESS as `0x${string}`,
          abi: SECRET_VOTE_ABI,
          functionName: 'getVoterCount',
          args: [BigInt(id)],
        })) as bigint;
        if (!mounted) return;
        setVoters(Number(vc));
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, meta.finalized]);

  const vote = async (optionIndex: number) => {
    setError(null);
    try {
      const signer = await signerPromise;
      if (!signer) throw new Error('Connect wallet');
      if (!instance) throw new Error('Encryption not ready');
      setSending(true);
      const c = new Contract(SECRET_VOTE_ADDRESS, SECRET_VOTE_ABI, signer);
      const buf = instance.createEncryptedInput(SECRET_VOTE_ADDRESS, await signer.getAddress());
      buf.add32(optionIndex);
      const encrypted = await buf.encrypt();
      const tx = await c.vote(id, encrypted.handles[0], encrypted.inputProof);
      await tx.wait();
      // refresh voter count
      try {
        const vc = (await client.readContract({
          address: SECRET_VOTE_ADDRESS as `0x${string}`,
          abi: SECRET_VOTE_ABI,
          functionName: 'getVoterCount',
          args: [BigInt(id)],
        })) as bigint;
        setVoters(Number(vc));
      } catch {}
      alert('Voted');
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setSending(false);
    }
  };

  const finalize = async () => {
    setError(null);
    try {
      const signer = await signerPromise;
      if (!signer) throw new Error('Connect wallet');
      setSending(true);
      const c = new Contract(SECRET_VOTE_ADDRESS, SECRET_VOTE_ABI, signer);
      const tx = await c.requestFinalize(id);
      await tx.wait();
      alert('Finalize requested. Results appear after oracle callback.');
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: 12 }}>{'< Back'}</button>
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>{meta.title}</h3>
        {(zamaLoading || zamaError) && (
          <div style={{ margin: '8px 0' }}>
            {zamaLoading && (
              <span style={{ padding: '4px 8px', borderRadius: 6, fontSize: 12, border: '1px solid #faebcc', background: '#fcf8e3', color: '#8a6d3b' }}>
                Encryption: Initializing…
              </span>
            )}
            {zamaError && (
              <span title={zamaError} style={{ marginLeft: 8, padding: '4px 8px', borderRadius: 6, fontSize: 12, border: '1px solid #ebccd1', background: '#f2dede', color: '#a94442' }}>
                Encryption: Error
              </span>
            )}
          </div>
        )}
        <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>
          Start: {new Date(Number(meta.startTime) * 1000).toLocaleString()} • End: {new Date(Number(meta.endTime) * 1000).toLocaleString()} • Voters: {voters ?? '...'}
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {meta.options.map((o: string, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 8, border: '1px solid #eee', borderRadius: 6 }}>
              <div>{o}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {counts != null && <span>{counts[i] ?? 0}</span>}
                <button onClick={() => vote(i)} disabled={!canVote || sending || zamaLoading || !!zamaError}>Vote</button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button onClick={finalize} disabled={!canFinalize || sending}>Finalize</button>
          {meta.pending && <span>Decryption pending…</span>}
        </div>
        {error && <div style={{ color: '#a00', marginTop: 8 }}>{error}</div>}
      </div>
    </div>
  );
}
