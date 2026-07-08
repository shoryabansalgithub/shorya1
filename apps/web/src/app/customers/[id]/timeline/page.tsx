import React from 'react';

export default function CustomerTimelinePage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Customer Timeline - {params.id}</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="p-6 text-center text-sm text-gray-500">
          Audit and Status History events will be displayed here.
        </div>
      </div>
    </div>
  );
}
