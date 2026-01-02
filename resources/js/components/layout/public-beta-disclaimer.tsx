import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info } from "lucide-react";

export default function PublicBetaDisclaimer() {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ duration: 0.5 }}
                    className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] flex flex-col md:flex-row gap-2 pointer-events-none"
                    role="alert"
                >
                    <div className="bg-amber-500/10 backdrop-blur-md border border-amber-500/20 text-amber-200 px-4 py-2 rounded-full flex items-center shadow-lg">
                        <AlertTriangle className="w-4 h-4 mr-2 text-amber-400" />
                        <span className="text-xs font-bold uppercase tracking-wider">Public Beta Build</span>
                    </div>

                    <div className="bg-blue-500/10 backdrop-blur-md border border-blue-500/20 text-blue-200 px-4 py-2 rounded-full flex items-center shadow-lg">
                        <Info className="w-4 h-4 mr-2 text-blue-400" />
                        <span className="text-xs font-medium">Numbers shown are for illustration purpose only</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
