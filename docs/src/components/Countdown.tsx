'use client';

import { useState, useEffect } from 'react';

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const launchDate = new Date('2025-11-02T00:00:00').getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="w-24 h-24 bg-white rounded-xl shadow-lg border-2 border-[#0066FF] flex items-center justify-center mb-2">
        <span className="text-4xl font-bold text-[#0066FF]">{String(value).padStart(2, '0')}</span>
      </div>
      <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center justify-center space-x-4">
      <TimeUnit value={timeLeft.days} label="Days" />
      <span className="text-3xl font-bold text-[#0066FF] pb-8">:</span>
      <TimeUnit value={timeLeft.hours} label="Hours" />
      <span className="text-3xl font-bold text-[#0066FF] pb-8">:</span>
      <TimeUnit value={timeLeft.minutes} label="Minutes" />
      <span className="text-3xl font-bold text-[#0066FF] pb-8">:</span>
      <TimeUnit value={timeLeft.seconds} label="Seconds" />
    </div>
  );
}

