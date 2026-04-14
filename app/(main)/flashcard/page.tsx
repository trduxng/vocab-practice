"use client";

import { useEffect, useState } from "react";
import FlashcardCard from "@/components/flashcard_ui/FlashcardCard";
import ReviewButtons from "@/components/flashcard_ui/ReviewButtons";
import ProgressBar from "@/components/flashcard_ui/ProgressBar";
import { Flashcard } from "@/types/flashcard";

export default function FlashcardPage() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/flashcards")
      .then((res) => res.json())
      .then((data) => {
        setCards(data);
        setLoading(false);
      });
  }, []);

  const currentCard = cards[index];

  const handleReview = async (rating: string) => {
    await fetch("/api/review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        flashcard_id: currentCard.id,
        rating,
      }),
    });

    setFlipped(false);
    setIndex((prev) => prev + 1);
  };

  if (loading) return <div>Loading...</div>;
  if (!currentCard) return <div>Hoàn thành!</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 space-y-6">
      <ProgressBar current={index + 1} total={cards.length} />

      <FlashcardCard
        card={currentCard}
        flipped={flipped}
        onFlip={() => setFlipped(!flipped)}
      />

      {flipped && <ReviewButtons onReview={handleReview} />}
    </div>
  );
}
