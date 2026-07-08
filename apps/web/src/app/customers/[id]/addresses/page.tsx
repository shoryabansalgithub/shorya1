import React from 'react';

export default function CustomerAddressesPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Customer Addresses - {params.id}</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition-colors">
          Add Address
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="p-6 text-center text-sm text-gray-500">
          Billing, Shipping, Office, Warehouse addresses will be displayed here.
        </div>
      </div>
    </div>
  );
}
