import React from "react";
import Button from "../Button";

function StatsBar({
  questionCount,
  studentCount,
  isPublished,
  onPublish,
  onStart,
  loading,
}) {
  return (
    <div className="bg-gray-600 text-white px-8 py-6 rounded-lg mb-8 flex justify-between items-center">
      <div>
        <p className="text-sm opacity-80 uppercase tracking-wider">Questions</p>
        <p className="text-4xl font-bold">{questionCount}</p>
      </div>
      <div>
        <p className="text-sm opacity-80 uppercase tracking-wider">Students</p>
        <p className="text-4xl font-bold">{studentCount}</p>
      </div>
      <div>
        <p className="text-sm opacity-80 uppercase tracking-wider">Status</p>
        <p className="text-2xl font-bold">
          {isPublished ? "✓ Published" : "Draft"}
        </p>
      </div>
      <div className="flex gap-3">
        {!isPublished ? (
          <Button
            text={loading ? "Publishing..." : "📤 Publish Quiz"}
            click={onPublish}
            disabled={questionCount === 0 || loading}
          />
        ) : (
          <Button
            text="🚀 Start Quiz"
            click={onStart}
            disabled={studentCount === 0}
          />
        )}
      </div>
    </div>
  );
}

export default StatsBar;
