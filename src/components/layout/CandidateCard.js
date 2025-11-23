export default function CandidateCard({ data }) {
  return (
    <div className="border rounded-xl p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-4">
        <img
          src={data.photoUrl || "/no-user.png"}
          alt="candidate"
          className="w-16 h-16 rounded-full object-cover"
        />

        <div>
          <h2 className="font-semibold text-lg">{data.fullName}</h2>
          <p className="text-sm text-gray-500">{data.age} yosh</p>
        </div>
      </div>

      <div className="mt-3 text-sm text-gray-600">
        <p>🇩🇪 Nemis tili: {data.germanLevel || "N/A"}</p>
        <p>📍 Manzil: {data.city}</p>
      </div>

      <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
        Batafsil
      </button>
    </div>
  );
}
