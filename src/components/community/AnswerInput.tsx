"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Textarea } from "@/components/Input";

interface AnswerInputProps {
  onSubmitAnswer: (text: string) => void;
}

export function AnswerInput({ onSubmitAnswer }: AnswerInputProps) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setError("Please write an answer before submitting.");
      return;
    }

    onSubmitAnswer(trimmed);
    setDraft("");
    setError("");
  };

  return (
    <div className="space-y-3">
      <Textarea
        rows={4}
        placeholder="Write your explanation or solution..."
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          if (error) setError("");
        }}
        error={error}
      />
      <div className="flex justify-end">
        <Button onClick={handleSubmit}>Submit Answer</Button>
      </div>
    </div>
  );
}
