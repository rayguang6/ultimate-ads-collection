import AuthToggle from './components/auth/AuthToggle';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Ultimate Ads Collection</h1>
        <AuthToggle />
      </main>
    </div>
  );
} 