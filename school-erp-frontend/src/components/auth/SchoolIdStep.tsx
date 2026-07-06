'use client';

interface SchoolIdStepProps {
  schoolId: string;
  setSchoolId: (v: string) => void;
  onNext: () => void;
  error: string | null;
  loading: boolean;
}

export default function SchoolIdStep({
  schoolId,
  setSchoolId,
  onNext,
  error,
  loading,
}: SchoolIdStepProps) {
  return (
    <div className="space-y-4">
      {/* 1. Label & Input field */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-zinc-400">
          School ID
        </label>
        <input
          type="text"
          value={schoolId}
          onChange={(e) => setSchoolId(e.target.value)}
          placeholder="e.g. SCH-2024-DL"
          className="w-full h-11 px-4 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 bg-zinc-900/50 hover:bg-zinc-900/80 text-white placeholder-zinc-500 transition-colors"
        />
        {/* 2. Helper text */}
        <p className="text-xs text-zinc-500">
          Provided by your school administrator
        </p>
      </div>

      {/* 3. Error box */}
      {error && error !== '' && (
        <p className="text-xs text-red-400 bg-red-950/20 border border-red-900/30 rounded-xl px-4 py-3 mt-2">
          {error}
        </p>
      )}

      {/* 4. Button */}
      <button
        onClick={onNext}
        disabled={loading}
        className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 disabled:border-zinc-800/40 text-white rounded-xl text-sm font-semibold transition-all duration-200 mt-4 flex items-center justify-center space-x-1"
      >
        <span>{loading ? 'Checking...' : 'Continue'}</span>
        {!loading && <span className="text-zinc-400">→</span>}
      </button>
    </div>
  );
}
