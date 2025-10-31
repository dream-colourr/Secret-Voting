import { useZamaInstance } from '../hooks/useZamaInstance';

export function ZamaStatus() {
  const { instance, isLoading, error } = useZamaInstance();

  const base: React.CSSProperties = {
    padding: '4px 8px',
    borderRadius: 6,
    fontSize: 12,
    border: '1px solid',
  };

  if (isLoading) {
    return (
      <span style={{ ...base, color: '#8a6d3b', borderColor: '#faebcc', background: '#fcf8e3' }}>
        Encryption: Initializing…
      </span>
    );
  }
  if (error) {
    return (
      <span
        title={error}
        style={{ ...base, color: '#a94442', borderColor: '#ebccd1', background: '#f2dede' }}
      >
        Encryption: Error
      </span>
    );
  }
  if (instance) {
    return (
      <span style={{ ...base, color: '#3c763d', borderColor: '#d6e9c6', background: '#dff0d8' }}>
        Encryption: Ready
      </span>
    );
  }
  return null;
}

