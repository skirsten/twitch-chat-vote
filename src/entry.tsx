import { motion, transform, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";

const mapHypeToColor = transform([-1, 20], ["#ccc", "#ff008c"]);
const mapHypeToSpringVelocity = transform([0, 10], [0, 40]);
const mapScale = transform([1, 10], [1, 5]);

type EntryProps = {
  hype: number;
  index: number;
  children: React.ReactNode;
};

export default function Entry(props: EntryProps) {
  const controls = useAnimation();

  const oldHype = useRef(0);

  useEffect(() => {
    const scale = mapScale(props.hype);

    if (props.hype > oldHype.current) {
      controls.start({
        scale,
        transition: {
          type: "spring",
          velocity: mapHypeToSpringVelocity(props.hype),
          stiffness: 700,
          damping: 80,
        },
      });
    } else {
      controls.start({
        scale,
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
