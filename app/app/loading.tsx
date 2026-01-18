export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-lime-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white/80 text-lg">Loading...</p>
      </div>
    </div>
  );
}
