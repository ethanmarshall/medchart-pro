import { useState, useEffect } from "react";

interface NextDoseCountdownProps {
  lastAdministeredAt: string | Date;
  periodicity: string;
}

export function NextDoseCountdown({ lastAdministeredAt, periodicity }: NextDoseCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    const calculateNextDose = () => {
      const lastDose = new Date(lastAdministeredAt);
      let nextDoseTime: Date;

      // Parse periodicity to determine next dose time
      const periodicityLower = periodicity.toLowerCase();
      
      if (periodicityLower.includes('every')) {
        const hourMatch = periodicityLower.match(/every\s+(\d+)\s+hours?/);
        if (hourMatch) {
          const hours = parseInt(hourMatch[1]);
          nextDoseTime = new Date(lastDose.getTime() + hours * 60 * 60 * 1000);
        } else {
          // Default to 6 hours if we can't parse
          nextDoseTime = new Date(lastDose.getTime() + 6 * 60 * 60 * 1000);
        }
      } else if (periodicityLower.includes('once daily')) {
        nextDoseTime = new Date(lastDose.getTime() + 24 * 60 * 60 * 1000);
      } else if (periodicityLower.includes('twice daily')) {
        nextDoseTime = new Date(lastDose.getTime() + 12 * 60 * 60 * 1000);
      } else if (periodicityLower.includes('three times daily')) {
        nextDoseTime = new Date(lastDose.getTime() + 8 * 60 * 60 * 1000);
      } else if (periodicityLower.includes('four times daily')) {
        nextDoseTime = new Date(lastDose.getTime() + 6 * 60 * 60 * 1000);
      } else if (periodicityLower.includes('as needed')) {
        // For PRN medications, show "As needed" instead of countdown
        setTimeLeft("As needed");
        setIsOverdue(false);
        return;
      } else {
        // Default to 6 hours
        nextDoseTime = new Date(lastDose.getTime() + 6 * 60 * 60 * 1000);
      }

      const now = new Date();
      const timeDiff = nextDoseTime.getTime() - now.getTime();

      if (timeDiff <= 0) {
        setIsOverdue(true);
        const overdueDiff = Math.abs(timeDiff);
        const overdueHours = Math.floor(overdueDiff / (1000 * 60 * 60));
        const overdueMinutes = Math.floor((overdueDiff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (overdueHours > 0) {
          setTimeLeft(`${overdueHours}h ${overdueMinutes}m overdue`);
        } else {
          setTimeLeft(`${overdueMinutes}m overdue`);
        }
      } else {
        setIsOverdue(false);
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m`);
        } else {
          setTimeLeft(`${minutes}m`);
        }
      }
    };

    calculateNextDose();
    const interval = setInterval(calculateNextDose, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [lastAdministeredAt, periodicity]);

  if (periodicity.toLowerCase().includes('as needed')) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
        <i className="fas fa-clock mr-1"></i>
        As needed
      </span>
    );
  }

  return (
    <span 
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
        isOverdue 
          ? 'bg-red-50 text-red-700 border-red-200' 
          : 'bg-green-50 text-green-700 border-green-200'
      }`}
      data-testid="next-dose-countdown"
    >
      <i className={`fas ${isOverdue ? 'fa-exclamation-triangle' : 'fa-clock'} mr-1`}></i>
      {isOverdue ? '' : 'Next in '}
      {timeLeft}
    </span>
  );
}