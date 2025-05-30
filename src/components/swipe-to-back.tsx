import { useIsMobile } from "@/hooks/useMobile";
import clsx from "clsx";
import { motion, PanInfo } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useSidebar } from "./ui/sidebar";

const SWIPE_TO_BACK_THRESHOLD = 50;


const SwipeToBack = ({ className, children }: React.PropsWithChildren<{ className?: any }>) => {
  const [dragState, setDragState] = useState(0);
  const isMobile = useIsMobile();
  const sidebar = useSidebar();


  const handleDragEnd = (info: PanInfo) => {
    if (info.offset.x > SWIPE_TO_BACK_THRESHOLD) {
      sidebar.setOpenMobile(true);
    }
    setDragState(0);
  }


  return <>
    <motion.div
      initial={{
        opacity: 0
      }}
      animate={{
        opacity: dragState
      }}
      transition={{
        type: 'tween',
      }}
      className="absolute w-fit h-fit left-2">

      <motion.div
        initial={{
          backgroundColor: 'transparent'
        }}
        animate={{
          backgroundColor: dragState === 1 ? 'var(--color-secondary)' : 'transparent'
        }}


        className="p-1 rounded-full">
        <ArrowLeft size={32} />
      </motion.div>
    </motion.div>


    <motion.div
      drag={isMobile ? "x" : false}
      // dragControls={dragControls}
      dragSnapToOrigin
      onDragEnd={(_, info) => handleDragEnd(info)}
      onDrag={(_, info) => {
        setDragState(Math.max(Math.min(info.offset.x / SWIPE_TO_BACK_THRESHOLD, 1), 0))
      }}

      className={clsx("", className)}>
      {children}
    </motion.div>
  </>
}


export default SwipeToBack