import { Logo } from "./Logo";
import { useResolvedColorScheme } from "../theme/backgrounds";

export function LoadingScreen(props: { title: string; message: string }) {
  const scheme = useResolvedColorScheme();
  return (
    <div className="loading-screen">
      <span className="eyebrow">Runtime gate</span>
      <Logo scheme={scheme} size={72} />
      <div className="loading-orb" />
      <h1>{props.title}</h1>
      <p>{props.message}</p>
    </div>
  );
}
