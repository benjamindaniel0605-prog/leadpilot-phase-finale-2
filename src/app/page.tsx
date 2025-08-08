import React from "react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          LeadPilot SaaS
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Générez plus de leads qualifiés avec l'IA
        </p>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Commencer gratuitement
        </button>
      </div>
    </div>
  )
}

