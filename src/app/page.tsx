import Link from "next/link";
export default function RootPage() {
  return (
    <main className="container main-content">
      <h1>Tskaltubo</h1>
      <p>Research & investment memo</p>
      <nav>
        <Link href="/en/">English</Link> · <Link href="/de/">Deutsch</Link> ·{" "}
        <Link href="/ka/">ქართული</Link>
      </nav>
    </main>
  );
}
