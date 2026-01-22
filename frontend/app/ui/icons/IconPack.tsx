/**
 * IconPack - Minimal vector icons for RUKA
 * 
 * All icons use Skia for crisp rendering at any size
 */

import React from 'react';
import IconBase from './IconBase';
import { getSkia } from '../../utils/optionalSkia';

const skia = getSkia();
const Path = skia?.Path;

const emptyIcon = (props: any) => (
  <IconBase {...props}>{() => null}</IconBase>
);

interface IconProps {
  size?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
}

export const IconHome = ({ size = 32, stroke = "#FFF", strokeWidth = 2, fill }: IconProps) => (
  !Path ? emptyIcon({ size, stroke, strokeWidth, fill }) :
  <IconBase size={size} stroke={stroke} strokeWidth={strokeWidth} fill={fill}>
    {({ size: s, stroke: st, strokeWidth: sw }) => (
      <Path
        path={`M ${s * 0.2} ${s * 0.7} L ${s * 0.5} ${s * 0.2} L ${s * 0.8} ${s * 0.7} V ${s * 0.9} H ${s * 0.2} Z`}
        color={st}
        style="stroke"
        strokeWidth={sw}
        fill={fill || "none"}
      />
    )}
  </IconBase>
);

export const IconChat = ({ size = 32, stroke = "#FFF", strokeWidth = 2, fill }: IconProps) => (
  !Path ? emptyIcon({ size, stroke, strokeWidth, fill }) :
  <IconBase size={size} stroke={stroke} strokeWidth={strokeWidth} fill={fill}>
    {({ size: s, stroke: st, strokeWidth: sw }) => (
      <>
        <Path
          path={`M ${s * 0.2} ${s * 0.3} L ${s * 0.2} ${s * 0.7} L ${s * 0.5} ${s * 0.7} L ${s * 0.7} ${s * 0.85} L ${s * 0.7} ${s * 0.7} L ${s * 0.8} ${s * 0.7} L ${s * 0.8} ${s * 0.3} Z`}
          color={st}
          style="stroke"
          strokeWidth={sw}
          fill={fill || "none"}
        />
        <Path
          path={`M ${s * 0.35} ${s * 0.45} L ${s * 0.5} ${s * 0.45}`}
          color={st}
          style="stroke"
          strokeWidth={sw * 0.8}
        />
        <Path
          path={`M ${s * 0.35} ${s * 0.55} L ${s * 0.65} ${s * 0.55}`}
          color={st}
          style="stroke"
          strokeWidth={sw * 0.8}
        />
      </>
    )}
  </IconBase>
);

export const IconPlay = ({ size = 32, stroke = "#FFF", strokeWidth = 2, fill }: IconProps) => (
  !Path ? emptyIcon({ size, stroke, strokeWidth, fill }) :
  <IconBase size={size} stroke={stroke} strokeWidth={strokeWidth} fill={fill}>
    {({ size: s, stroke: st, strokeWidth: sw }) => (
      <Path
        path={`M ${s * 0.3} ${s * 0.2} L ${s * 0.3} ${s * 0.8} L ${s * 0.75} ${s * 0.5} Z`}
        color={st}
        style="stroke"
        strokeWidth={sw}
        fill={fill || st}
      />
    )}
  </IconBase>
);

export const IconPause = ({ size = 32, stroke = "#FFF", strokeWidth = 2, fill }: IconProps) => (
  !Path ? emptyIcon({ size, stroke, strokeWidth, fill }) :
  <IconBase size={size} stroke={stroke} strokeWidth={strokeWidth} fill={fill}>
    {({ size: s, stroke: st, strokeWidth: sw }) => (
      <>
        <Path
          path={`M ${s * 0.3} ${s * 0.2} L ${s * 0.3} ${s * 0.8} L ${s * 0.45} ${s * 0.8} L ${s * 0.45} ${s * 0.2} Z`}
          color={st}
          style="stroke"
          strokeWidth={sw}
          fill={fill || "none"}
        />
        <Path
          path={`M ${s * 0.55} ${s * 0.2} L ${s * 0.55} ${s * 0.8} L ${s * 0.7} ${s * 0.8} L ${s * 0.7} ${s * 0.2} Z`}
          color={st}
          style="stroke"
          strokeWidth={sw}
          fill={fill || "none"}
        />
      </>
    )}
  </IconBase>
);

export const IconMic = ({ size = 32, stroke = "#FFF", strokeWidth = 2, fill }: IconProps) => (
  !Path ? emptyIcon({ size, stroke, strokeWidth, fill }) :
  <IconBase size={size} stroke={stroke} strokeWidth={strokeWidth} fill={fill}>
    {({ size: s, stroke: st, strokeWidth: sw }) => (
      <>
        <Path
          path={`M ${s * 0.5} ${s * 0.2} L ${s * 0.5} ${s * 0.6}`}
          color={st}
          style="stroke"
          strokeWidth={sw}
        />
        <Path
          path={`M ${s * 0.35} ${s * 0.6} L ${s * 0.35} ${s * 0.75} Q ${s * 0.35} ${s * 0.8} ${s * 0.4} ${s * 0.8} L ${s * 0.6} ${s * 0.8} Q ${s * 0.65} ${s * 0.8} ${s * 0.65} ${s * 0.75} L ${s * 0.65} ${s * 0.6}`}
          color={st}
          style="stroke"
          strokeWidth={sw}
          fill="none"
        />
        <Path
          path={`M ${s * 0.4} ${s * 0.6} L ${s * 0.6} ${s * 0.6}`}
          color={st}
          style="stroke"
          strokeWidth={sw}
        />
        <Path
          path={`M ${s * 0.5} ${s * 0.8} L ${s * 0.5} ${s * 0.85}`}
          color={st}
          style="stroke"
          strokeWidth={sw}
        />
        <Path
          path={`M ${s * 0.4} ${s * 0.85} L ${s * 0.6} ${s * 0.85}`}
          color={st}
          style="stroke"
          strokeWidth={sw}
        />
      </>
    )}
  </IconBase>
);

export const IconSearch = ({ size = 32, stroke = "#FFF", strokeWidth = 2, fill }: IconProps) => (
  !Path ? emptyIcon({ size, stroke, strokeWidth, fill }) :
  <IconBase size={size} stroke={stroke} strokeWidth={strokeWidth} fill={fill}>
    {({ size: s, stroke: st, strokeWidth: sw }) => (
      <>
        <Path
          path={`M ${s * 0.3} ${s * 0.3} Q ${s * 0.3} ${s * 0.3} ${s * 0.4} ${s * 0.4} L ${s * 0.6} ${s * 0.6} Q ${s * 0.7} ${s * 0.7} ${s * 0.6} ${s * 0.6} L ${s * 0.4} ${s * 0.4} Q ${s * 0.3} ${s * 0.3} ${s * 0.3} ${s * 0.3} Z`}
          color={st}
          style="stroke"
          strokeWidth={sw}
          fill="none"
        />
        <Path
          path={`M ${s * 0.65} ${s * 0.65} L ${s * 0.75} ${s * 0.75}`}
          color={st}
          style="stroke"
          strokeWidth={sw}
        />
      </>
    )}
  </IconBase>
);

export const IconSettings = ({ size = 32, stroke = "#FFF", strokeWidth = 2, fill }: IconProps) => (
  !Path ? emptyIcon({ size, stroke, strokeWidth, fill }) :
  <IconBase size={size} stroke={stroke} strokeWidth={strokeWidth} fill={fill}>
    {({ size: s, stroke: st, strokeWidth: sw }) => (
      <>
        <Path
          path={`M ${s * 0.5} ${s * 0.2} L ${s * 0.5} ${s * 0.35}`}
          color={st}
          style="stroke"
          strokeWidth={sw}
        />
        <Path
          path={`M ${s * 0.5} ${s * 0.65} L ${s * 0.5} ${s * 0.8}`}
          color={st}
          style="stroke"
          strokeWidth={sw}
        />
        <Path
          path={`M ${s * 0.35} ${s * 0.35} Q ${s * 0.3} ${s * 0.4} ${s * 0.3} ${s * 0.5} Q ${s * 0.3} ${s * 0.6} ${s * 0.35} ${s * 0.65} L ${s * 0.45} ${s * 0.75} Q ${s * 0.5} ${s * 0.8} ${s * 0.55} ${s * 0.75} L ${s * 0.65} ${s * 0.65} Q ${s * 0.7} ${s * 0.6} ${s * 0.7} ${s * 0.5} Q ${s * 0.7} ${s * 0.4} ${s * 0.65} ${s * 0.35} L ${s * 0.55} ${s * 0.25} Q ${s * 0.5} ${s * 0.2} ${s * 0.45} ${s * 0.25} Z`}
          color={st}
          style="stroke"
          strokeWidth={sw}
          fill="none"
        />
      </>
    )}
  </IconBase>
);

export const IconLightning = ({ size = 32, stroke = "#FFF", strokeWidth = 2, fill }: IconProps) => (
  !Path ? emptyIcon({ size, stroke, strokeWidth, fill }) :
  <IconBase size={size} stroke={stroke} strokeWidth={strokeWidth} fill={fill}>
    {({ size: s, stroke: st, strokeWidth: sw }) => (
      <Path
        path={`M ${s * 0.5} ${s * 0.1} L ${s * 0.35} ${s * 0.5} L ${s * 0.45} ${s * 0.5} L ${s * 0.3} ${s * 0.9} L ${s * 0.65} ${s * 0.5} L ${s * 0.55} ${s * 0.5} Z`}
        color={st}
        style="stroke"
        strokeWidth={sw}
        fill={fill || st}
      />
    )}
  </IconBase>
);

export const IconBook = ({ size = 32, stroke = "#FFF", strokeWidth = 2, fill }: IconProps) => (
  !Path ? emptyIcon({ size, stroke, strokeWidth, fill }) :
  <IconBase size={size} stroke={stroke} strokeWidth={strokeWidth} fill={fill}>
    {({ size: s, stroke: st, strokeWidth: sw }) => (
      <>
        <Path
          path={`M ${s * 0.25} ${s * 0.2} L ${s * 0.25} ${s * 0.8} L ${s * 0.75} ${s * 0.8} L ${s * 0.75} ${s * 0.2} Z`}
          color={st}
          style="stroke"
          strokeWidth={sw}
          fill="none"
        />
        <Path
          path={`M ${s * 0.4} ${s * 0.2} L ${s * 0.4} ${s * 0.8}`}
          color={st}
          style="stroke"
          strokeWidth={sw * 0.8}
        />
        <Path
          path={`M ${s * 0.5} ${s * 0.2} L ${s * 0.5} ${s * 0.8}`}
          color={st}
          style="stroke"
          strokeWidth={sw * 0.8}
        />
        <Path
          path={`M ${s * 0.6} ${s * 0.2} L ${s * 0.6} ${s * 0.8}`}
          color={st}
          style="stroke"
          strokeWidth={sw * 0.8}
        />
      </>
    )}
  </IconBase>
);

export const IconCertificate = ({ size = 32, stroke = "#FFF", strokeWidth = 2, fill }: IconProps) => (
  !Path ? emptyIcon({ size, stroke, strokeWidth, fill }) :
  <IconBase size={size} stroke={stroke} strokeWidth={strokeWidth} fill={fill}>
    {({ size: s, stroke: st, strokeWidth: sw }) => (
      <>
        <Path
          path={`M ${s * 0.2} ${s * 0.2} L ${s * 0.8} ${s * 0.2} L ${s * 0.8} ${s * 0.7} L ${s * 0.2} ${s * 0.7} Z`}
          color={st}
          style="stroke"
          strokeWidth={sw}
          fill="none"
        />
        <Path
          path={`M ${s * 0.35} ${s * 0.35} L ${s * 0.65} ${s * 0.35}`}
          color={st}
          style="stroke"
          strokeWidth={sw * 0.8}
        />
        <Path
          path={`M ${s * 0.35} ${s * 0.5} L ${s * 0.65} ${s * 0.5}`}
          color={st}
          style="stroke"
          strokeWidth={sw * 0.8}
        />
        <Path
          path={`M ${s * 0.5} ${s * 0.7} L ${s * 0.5} ${s * 0.85} L ${s * 0.4} ${s * 0.9} L ${s * 0.5} ${s * 0.85} L ${s * 0.6} ${s * 0.9} Z`}
          color={st}
          style="stroke"
          strokeWidth={sw}
          fill={fill || st}
        />
      </>
    )}
  </IconBase>
);

export const IconSnowflake = ({ size = 32, stroke = "#FFF", strokeWidth = 2, fill }: IconProps) => (
  !Path ? emptyIcon({ size, stroke, strokeWidth, fill }) :
  <IconBase size={size} stroke={stroke} strokeWidth={strokeWidth} fill={fill}>
    {({ size: s, stroke: st, strokeWidth: sw }) => {
      const center = s * 0.5;
      const radius = s * 0.35;
      // Create a 6-pointed snowflake
      const paths = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x1 = center + radius * Math.cos(angle);
        const y1 = center + radius * Math.sin(angle);
        const x2 = center - radius * Math.cos(angle);
        const y2 = center - radius * Math.sin(angle);
        paths.push(`M ${center} ${center} L ${x1} ${y1}`);
        paths.push(`M ${center} ${center} L ${x2} ${y2}`);
        // Add side branches
        const branchLength = radius * 0.4;
        const branchAngle1 = angle + Math.PI / 6;
        const branchAngle2 = angle - Math.PI / 6;
        const bx1 = x1 + branchLength * Math.cos(branchAngle1);
        const by1 = y1 + branchLength * Math.sin(branchAngle1);
        const bx2 = x1 + branchLength * Math.cos(branchAngle2);
        const by2 = y1 + branchLength * Math.sin(branchAngle2);
        paths.push(`M ${x1} ${y1} L ${bx1} ${by1}`);
        paths.push(`M ${x1} ${y1} L ${bx2} ${by2}`);
      }
      return (
        <>
          {paths.map((path, idx) => (
            <Path
              key={idx}
              path={path}
              color={st}
              style="stroke"
              strokeWidth={sw}
            />
          ))}
          <Path
            path={`M ${center} ${center - radius * 0.15} L ${center} ${center + radius * 0.15} M ${center - radius * 0.15} ${center} L ${center + radius * 0.15} ${center}`}
            color={st}
            style="stroke"
            strokeWidth={sw * 1.2}
          />
        </>
      );
    }}
  </IconBase>
);
