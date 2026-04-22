export interface Answer {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  title: string;
  body: string;
  answers: Answer[];
}
