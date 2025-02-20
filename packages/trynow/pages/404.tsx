import Link from 'next/link';

export default function Custom404() {
  return (
    <div style={{ textAlign: 'center' }}>
      <h1 style={{}}>Page Not Found</h1>
      <Link href="/">Return home</Link>
    </div>
  );
}
