export const TABLE_TOPICS = [
  "If you could have dinner with any historical figure, who would it be and why?",
  "What is the best piece of advice you've ever received?",
  "If you could master any skill instantly, what would it be?",
  "Describe your perfect day from start to finish.",
  "What book has had the biggest impact on your life?",
  "If you could live in any era, which would you choose?",
  "What is one thing you would change about the education system?",
  "Describe a moment when you felt truly proud of yourself.",
  "If you could solve one world problem, what would it be?",
  "What does success mean to you?",
  "If you could start any business, what would it be?",
  "What is the most important quality in a friend?",
  "Describe a time when failure taught you something valuable.",
  "If you could have any superpower for a day, what would it be?",
  "What tradition do you think should be started?",
  "How has technology changed the way we communicate?",
  "What is your favorite way to spend a weekend?",
  "If you could learn the answer to one question, what would you ask?",
  "What motivates you to keep going when things get tough?",
  "Describe the best trip you've ever taken.",
  "What is one thing you wish you had learned earlier in life?",
  "If you could give your younger self one piece of advice, what would it be?",
  "What does leadership mean to you?",
  "Describe a person who has inspired you.",
  "If you could change one thing about yourself, what would it be?",
  "What is the most courageous thing you've ever done?",
  "How do you define happiness?",
  "What is one goal you hope to achieve this year?",
  "If you could witness any event in history, what would it be?",
  "What role does failure play in success?",
];

export function getRandomPrompt(): string {
  return TABLE_TOPICS[Math.floor(Math.random() * TABLE_TOPICS.length)];
}

export interface Recording {
  id: string;
  prompt: string;
  audioUrl: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  createdAt: Date;
}

export function saveRecording(recording: Recording): void {
  const recordings = getRecordings();
  recordings.unshift(recording);
  localStorage.setItem("recordings", JSON.stringify(recordings));
}

export function getRecordings(): Recording[] {
  const stored = localStorage.getItem("recordings");
  if (!stored) return [];
  const recordings = JSON.parse(stored);
  return recordings.map((r: Recording) => ({
    ...r,
    createdAt: new Date(r.createdAt),
  }));
}

export function deleteRecording(id: string): void {
  const recordings = getRecordings().filter((r) => r.id !== id);
  localStorage.setItem("recordings", JSON.stringify(recordings));
}