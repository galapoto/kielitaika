import { logoAssets } from "../theme/logoAssets";
import type { ColorScheme } from "../theme/backgrounds";

export function Logo(props: { scheme: ColorScheme; size?: number; showWordmark?: boolean; className?: string }) {
  const size = props.size || 64;
  return (
    <div className={`logo-lockup ${props.className || ""}`.trim()}>
      <img src={logoAssets[props.scheme]} alt="KieliTaika" width={size} height={size} />
      {props.showWordmark === false ? null : (
        <div className="logo-copy">
          <strong>KieliTaika</strong>
          <span>Contract-bound learner</span>
        </div>
      )}
    </div>
  );
}
