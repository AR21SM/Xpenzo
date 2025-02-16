import { Link } from "react-router-dom";

export function BottomWarning({ label, buttonText, to }) {
  return (
    <div className="mt-4 text-center">
      <p className="text-sm text-gray-600">
        {label}{" "}
        <Link to={to} className="text-indigo-600 hover:underline">
          {buttonText}
        </Link>
      </p>
    </div>
  );
}
