import { Card } from "@/components/ui/card";
import { Flashcard } from "@/types/flashcard";

type Props = {
  card: Flashcard;
  flipped: boolean;
  onFlip: () => void;
};

export default function FlashcardCard({ card, flipped, onFlip }: Props) {
  return (
    <Card className="p-10 text-center cursor-pointer" onClick={onFlip}>
      {!flipped ? (
        <div>
          <h2 className="text-2xl font-bold">{card.word}</h2>
          <p className="text-gray-500">{card.pos}</p>
        </div>
      ) : (
        <div>
          <p className="text-lg">{card.meaning}</p>
          <p className="text-sm mt-2 italic">{card.example}</p>
        </div>
      )}
    </Card>
  );
}
