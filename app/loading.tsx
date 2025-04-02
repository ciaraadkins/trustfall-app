export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] text-[#33FF33]">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#33FF33]/50 border-r-transparent"></div>
        <p className="mt-4 font-mono">LOADING_</p>
      </div>
    </div>
  )
}

