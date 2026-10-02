import { FC } from 'react';

// The MuseMeter logo mark (public/musemeter.png) redrawn as SVG: dots and bars on a centre line.
// Each entry is a bar height, or 0 for a dot. The tallest bar is the "peak", picked out in the accent colour.
const MARKS = [0, 0, 8, 20, 0, 15, 34, 12, 0, 10, 16, 0, 0];
const PEAK = MARKS.indexOf(Math.max(...MARKS));
const STEP = 10;
const HEIGHT = 36;

interface WaveformProps {
  className?: string;
  // Animate the bars like a level meter (used as the loading indicator)
  animated?: boolean;
}

const Waveform: FC<WaveformProps> = ({ className = '', animated = false }) => (
  <svg
    className={className}
    viewBox={`0 0 ${MARKS.length * STEP} ${HEIGHT}`}
    fill="currentColor"
    aria-hidden="true"
  >
    {MARKS.map((height, i) => {
      const cx = i * STEP + STEP / 2;
      if (height === 0) {
        return <circle key={i} cx={cx} cy={HEIGHT / 2} r={2.25} />;
      }
      const width = i === PEAK ? 2.5 : 3.5;
      return (
        <rect
          key={i}
          x={cx - width / 2}
          y={(HEIGHT - height) / 2}
          width={width}
          height={height}
          className={`${i === PEAK ? 'text-accent-500 dark:text-accent-300' : ''} ${animated ? 'meter-bar' : ''}`}
          fill={i === PEAK ? 'currentColor' : undefined}
          style={animated ? { animationDelay: `${(i % 4) * -0.18}s` } : undefined}
        />
      );
    })}
  </svg>
);

export default Waveform;
