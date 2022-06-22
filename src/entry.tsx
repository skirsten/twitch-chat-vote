import { motion, transform, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";

const max = 10;

const mapHypeToColor = transform([-1, 2 * max], ["#ccc", "#ff008c"]);
const mapHypeToSpringVelocity = transform([0, max], [0, 50]);

type EntryProps = {
  hype: number;
  index: number;
  children: React.ReactNode;
};

export default function Entry(props: EntryProps) {
  const controls = useAnimation();

  const oldHype = useRef(0);

  useEffect(() => {
    const hype = Math.min(props.hype, max);

    if (props.hype > oldHype.current) {
      controls.start({
        scale: hype,
        transition: {
          type: "spring",
          velocity: mapHypeToSpringVelocity(props.hype),
          stiffness: 700,
          damping: 80,
        },
      });
    } else {
      controls.start({
        scale: hype,
      });
    }

    oldHype.current = props.hype;
  }, [props.hype]);

  return (
    <motion.div
      layout
      animate={controls}
      style={{ color: mapHypeToColor(props.hype), zIndex: 1000 - props.index }}
    >
      {props.children}
    </motion.div>
  );
}
