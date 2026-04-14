export type Flashcard = {
  id: number;
  word: string;
  meaning: string;
  example: string;
  pos?: string;
  audio_url?: string;
  image_url?: string;
};
