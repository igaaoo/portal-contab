export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16 }}>
      <div style={{ fontSize: 48, fontWeight: 700, color: '#0F766E' }}>404</div>
      <div style={{ fontSize: 18, color: '#5C5A52' }}>Página não encontrada</div>
      <a href="/dashboard" style={{ color: '#0F766E', fontWeight: 500 }}>← Voltar ao início</a>
    </div>
  );
}
