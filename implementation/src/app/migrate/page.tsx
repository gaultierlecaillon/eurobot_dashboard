'use client'

import { useState } from 'react'
import { migrateData } from '@/services/dataService'

export default function MigratePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleMigration = async () => {
    try {
      setLoading(true)
      setError(null)
      setResult(null)

      const migrationResult = await migrateData()
      setResult(migrationResult)
    } catch (err) {
      console.error('Migration error:', err)
      setError(err instanceof Error ? err.message : 'Migration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Data Migration</h1>
      
      <div className="max-w-2xl">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold mb-2">Migrate CSV Data to MongoDB</h2>
          <p className="text-gray-700 mb-4">
            This will migrate all CSV data from the public/data directory to your MongoDB database. 
            This process will clear any existing data in the database and replace it with the CSV data.
          </p>
          <p className="text-sm text-gray-600">
            Make sure MongoDB is running and the connection string is properly configured in your .env.local file.
          </p>
        </div>

        <button
          onClick={handleMigration}
          disabled={loading}
          className={`px-6 py-3 rounded-lg font-medium ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {loading ? 'Migrating...' : 'Start Migration'}
        </button>

        {loading && (
          <div className="mt-6 flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mr-3"></div>
            <span>Migrating data, please wait...</span>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-bold text-red-800 mb-2">Migration Failed</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-bold text-green-800 mb-2">Migration Completed Successfully!</h3>
            <div className="text-green-700">
              <p><strong>Matches migrated:</strong> {result.results.matches}</p>
              <p><strong>Rankings migrated:</strong> {result.results.rankings}</p>
              {result.results.errors.length > 0 && (
                <div className="mt-3">
                  <p><strong>Errors encountered:</strong></p>
                  <ul className="list-disc list-inside mt-1">
                    {result.results.errors.map((error: string, index: number) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="mt-4">
              <a
                href="/"
                className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
