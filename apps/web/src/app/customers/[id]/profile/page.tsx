import React from 'react';

export default function CustomerProfilePage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Customer Profile - {params.id}</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition-colors">
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">KYC & Compliance</h2>
          <div className="text-sm text-gray-500">GSTIN, PAN, Business Type pending integration.</div>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Preferences</h2>
          <div className="text-sm text-gray-500">Language, Currency, Timezone pending integration.</div>
        </div>
      </div>
    </div>
  );
}
