type Props = {
  onReview: (rating: string) => void;
};

export default function ReviewButtons({ onReview }: Props) {
  return (
    <div className="flex justify-between">
      <button onClick={() => onReview("again")}>Again</button>
      <button onClick={() => onReview("hard")}>Hard</button>
      <button onClick={() => onReview("good")}>Good</button>
      <button onClick={() => onReview("easy")}>Easy</button>
    </div>
  );
}
