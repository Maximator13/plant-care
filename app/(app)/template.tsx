// Re-mounted on every navigation (unlike the layout), so each page fades in gently.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-300">{children}</div>;
}
