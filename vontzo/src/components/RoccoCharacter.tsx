import roccoNeutral from "@/assets/rocco_neutral.png";
import roccoLoss from "@/assets/rocco_loss.png";
import roccoSerious from "@/assets/rocco_serious.png";
import roccoVictory from "@/assets/rocco_victory.png";

const EXPRESSION_MAP = {
  neutral: roccoNeutral,
  happy: roccoVictory,
  sad: roccoLoss,
  thinking: roccoSerious,
};

export function RoccoCharacter({
  expression = "neutral",
  className = "",
}: {
  expression?: "neutral" | "happy" | "sad" | "thinking";
  className?: string;
}) {
  return (
    <img
      src={EXPRESSION_MAP[expression]}
      alt={`Rocco is ${expression}`}
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
}
