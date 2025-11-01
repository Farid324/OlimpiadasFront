export default function PremiacionView() {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-8 flex flex-col items-center text-center">
      <div className="text-gray-500 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mx-auto mb-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11.5c2.485 0 4.5-2.015 4.5-4.5S14.485 2.5 12 2.5 7.5 4.515 7.5 7s2.015 4.5 4.5 4.5zm0 0v9m0 0H8m4 0h4" />
        </svg>
        <h2 className="text-lg font-semibold text-gray-800">Evaluación Final</h2>
        <p className="text-sm text-gray-500 mt-1">
          Proceder con la evaluación de olimpistas clasificados
        </p>
      </div>
      <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
        Iniciar Evaluación Final
      </button>
    </div>
  );
}
