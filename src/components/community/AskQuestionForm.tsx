"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/Button";
import { Input, Textarea } from "@/components/Input";

interface AskQuestionFormProps {
  onSubmitQuestion: (payload: { title: string; body: string }) => void;
}

export function AskQuestionForm({ onSubmitQuestion }: AskQuestionFormProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextTitle = title.trim();
    const nextBody = body.trim();

    if (!nextTitle || !nextBody) {
      setError("Please add both a title and description.");
      return;
    }

    onSubmitQuestion({ title: nextTitle, body: nextBody });
    setTitle("");
    setBody("");
    setError("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        value={title}
        onChange={(event) => {
          setTitle(event.target.value);
          if (error) setError("");
        }}
        placeholder="Question title (e.g., How do you solve quadratic equations using factoring?)"
      />
      <Textarea
        rows={4}
        value={body}
        onChange={(event) => {
          setBody(event.target.value);
          if (error) setError("");
        }}
        placeholder="Describe the problem, what you tried, and where you got stuck."
        error={error}
      />
      <div className="flex justify-end">
        <Button type="submit">Post Question</Button>
      </div>
    </form>
  );
}
