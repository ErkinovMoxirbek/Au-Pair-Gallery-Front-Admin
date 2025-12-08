// src/pages/dashboard/ComingSoon.js
import { Clock, Sparkles } from "lucide-react";

export default function ComingSoon() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white shadow-sm border border-gray-200 rounded-2xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Bu bo‘lim tez orada ochiladi
        </h1>

        <p className="text-sm text-gray-600 mb-4">
          Hozircha bu yerda savol berish imkoni yo‘q.
          <br />
          Biz siz uchun qulay va tushunarli bo‘lim ustida ishlayapmiz.
        </p>

        <div className="inline-flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-full">
          <Sparkles className="w-4 h-4" />
          <span>Yaqin kunlarda to‘liq ishga tushadi</span>
        </div>
      </div>
    </div>
  );
}
