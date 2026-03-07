// /frontend/src/components/TargetSelector.js

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Users } from "lucide-react";

const targetGroups = [
  "TK A",
  "TK B",
  "SD Kelas 1",
  "SD Kelas 2",
  "SD Kelas 3",
  "SD Kelas 4",
  "SD Kelas 5",
  "SD Kelas 6",
  "SMP Kelas 7",
  "SMP Kelas 8",
  "SMP Kelas 9",
  "SMA Kelas 10",
  "SMA Kelas 11",
  "SMA Kelas 12",
];

const TargetSelector = ({ selectedTarget, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value) => {
    onChange(value);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      {/* Label Header */}
      <label className="text-lg font-bold text-orange-500 mb-2 block">
        Target Kelompok Sasaran
      </label>

      {/* Dropdown Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 flex items-center justify-between text-left focus:ring-1 focus:ring-orange-400 hover:border-orange-300 transition"
      >
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-orange-500" />
          <span className="font-medium text-slate-700">
            {selectedTarget || "Pilih Target"}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown List */}
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 mt-2 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {targetGroups.map((group) => (
              <li
                key={group}
                onClick={() => handleSelect(group)}
                className={`px-4 py-2 cursor-pointer transition-colors duration-150 ${
                  selectedTarget === group
                    ? "bg-orange-100 text-orange-700 font-semibold"
                    : "hover:bg-orange-50 text-slate-700"
                }`}
              >
                {group}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TargetSelector;
