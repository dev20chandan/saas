export interface SuccessStepProps {
  onNext: () => void;
  onBack: () => void;
  schoolId: string;
  setSchoolId: (val: string) => void;
  error: string | null;
  loading: boolean;
}

export default function SuccessStep({ onBack }: SuccessStepProps) {
  return (
    <div className="text-center">
      <h2 className="text-lg font-bold mb-4 text-green-600">Success!</h2>
      <button 
        onClick={onBack}
        className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium py-2 rounded-xl"
      >
        Restart
      </button>
    </div>
  );
}
