import { useState } from "react";
import { ChevronDown } from "lucide-react";

const models = ["Computer Science", "Economics", "Electrical Engineering", "Mathematics", "Physics", "Quantitative Biology", "Quantitative Finance", "Statistics" ];

export default function ModelDropdown({ selectedModel, setSelectedModel }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (model) => {
    setSelectedModel(model);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left ml-5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-md shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        {selectedModel}
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
          <ul className="py-1">
            {models.map((model) => (
              <li
                key={model}
                onClick={() => handleSelect(model)}
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                {model}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
