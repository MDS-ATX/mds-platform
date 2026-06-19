export function NotConnectedBanner({ error }: { error?: string }) {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 px-5 py-4 print:hidden">
      <p className="font-semibold text-amber-900">Follow Up Boss not connected</p>
      <p className="text-sm text-amber-800 mt-1">
        Live lead data is unavailable. Set a valid <code className="font-mono">FUB_API_KEY</code>{" "}
        in <code className="font-mono">.env.local</code> to populate the dashboard.
      </p>
      {error && (
        <p className="text-xs text-amber-700/80 mt-2 font-mono break-words">{error}</p>
      )}
    </div>
  );
}
