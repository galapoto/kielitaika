import Card from "../../components/ui/Card";
import TextBlock from "../../components/ui/TextBlock";
import type { ExamPrompt } from "../../types/exam";
import AudioPlayer from "./AudioPlayer";

function promptBlocks(prompt: ExamPrompt): string[] {
  return [...new Set([prompt.text, prompt.instruction, prompt.instructions, prompt.context])]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .map((value) => value.trim());
}

type Props = {
  prompt: ExamPrompt;
};

export default function PromptMaterial({ prompt }: Props) {
  const blocks = promptBlocks(prompt);
  const audioUrl = prompt.audio_url || null;

  return (
    <div className="prompt-material">
      {prompt.title ? (
        <Card>
          <TextBlock>{prompt.title}</TextBlock>
        </Card>
      ) : null}

      {audioUrl ? <AudioPlayer src={audioUrl} autoPlay /> : null}

      {blocks.map((block, index) => (
        <Card key={`${prompt.title || "prompt"}-material-${index}`}>
          <TextBlock>{block}</TextBlock>
        </Card>
      ))}
    </div>
  );
}
