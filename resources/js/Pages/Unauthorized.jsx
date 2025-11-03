import React from "react";
import { motion } from "framer-motion";

export default function Unauthorized() {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 text-gray-800">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-center text-center space-y-4"
            >
                <h1 className="text-[7rem] sm:text-[8rem] font-extrabold text-gray-900 leading-none">
                    403
                </h1>

                <p className="text-xl sm:text-2xl font-semibold text-gray-700">
                    Access Forbidden
                </p>
                <p className="text-gray-500 max-w-sm">
                    Oops! Looks like you wandered somewhere you’re not allowed.
                </p>

                <a
                    href="/"
                    className="mt-8 px-8 py-3 bg-gray-900 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg hover:bg-gray-800 transition-all duration-300"
                >
                    Go Back Home
                </a>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 1 }}
                className="absolute bottom-6 text-xs text-gray-400"
            >
                © {new Date().getFullYear()} PSU Learn Hub
            </motion.div>
        </div>
    );
}
