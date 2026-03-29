import PracticeView from "./PracticeView";

type Props = {
  moduleId: string | null;
};

export default function PracticeFeature({ moduleId }: Props) {
  return <PracticeView moduleId={moduleId} />;
}
