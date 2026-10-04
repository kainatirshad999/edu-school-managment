export default function Placeholder({ title }) {
  return (
    <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
      <h2 className="text-xl font-semibold text-gray-700 mb-2">{title}</h2>
      <p className="text-gray-400">
        This module is coming soon.
      </p>
    </div>
  );
}
