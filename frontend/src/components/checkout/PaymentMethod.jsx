'use client';


export default function PaymentMethod({ formData, updateFormData, onNext, onBack }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
        <p className="mt-2 text-gray-600">Choose your preferred payment option</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-600">Payment method selection component</p>
          <p className="text-sm text-gray-500 mt-2">Will be implemented</p>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg
              hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 transition-all
              flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Back
          </button>

          <button
            type="submit"
            className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg
              hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 transition-all
              flex items-center gap-2"
          >
            Review Order
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}