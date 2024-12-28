"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronRight } from "lucide-react";

interface LogEntry {
  timestamp: string;
  message: string;
}

interface LogDisplayProps {
  initialLogs?: LogEntry[];
}

export default function LogDisplay({ initialLogs = [] }: LogDisplayProps) {
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string) => {
    const newLog: LogEntry = {
      timestamp: new Date().toISOString(),
      message,
    };
    setLogs((prevLogs) => [...prevLogs, newLog]);
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="w-full  mx-auto">
      <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-gray-400 text-sm">bash</span>
        </div>
        <div className="p-4 h-96 overflow-y-auto font-mono text-sm text-gray-300">
          {logs.map((log, index) => (
            <div key={index} className="mb-1">
              <span className="text-blue-400">[{log.timestamp}]</span>{" "}
              <span className="text-green-400">user@localhost</span>
              <span className="text-gray-400">:</span>
              <span className="text-purple-400">~</span>
              <span className="text-gray-400">$</span> {log.message}
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
