export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-[calc(100vh-4rem)] bg-white text-black">{children}</div>;
}
