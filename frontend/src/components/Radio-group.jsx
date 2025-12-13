import React from "react";

function RadioGroup({ options, id, register }) {
  return (
    <div className="space-y-4">
      {options.map((option, index) => (
        <label
          key={index}
          className="flex items-center gap-4 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-gray-500 hover:bg-gray-50 transition-all"
        >
          <input
            type="radio"
            {...register(`answers.${id}`)}
            value={String(index)} // Make sure this is the index as string
            className="w-5 h-5"
          />
          <span className="text-lg">
            <span className="font-bold mr-3">
              {String.fromCharCode(65 + index)}.
            </span>
            {option}
          </span>
        </label>
      ))}
    </div>
  );
}

export default RadioGroup;
