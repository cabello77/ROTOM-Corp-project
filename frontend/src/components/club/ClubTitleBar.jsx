import { getDaysRemainingLabel } from "../../utils/date";

export default function ClubTitleBar({ club }) {
  return (
    <div className="text-center py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1
          className="text-4xl font-semibold text-gray-800 mb-3"
          style={{}}
        >
          {club.name}
        </h1>
      </div>
    </div>
  );
}


