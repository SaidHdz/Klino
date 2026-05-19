import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';
import { formatTimeAgo } from '../utils/time';

export const TimeDisplay = ({ time, className, style, numberOfLines }: { time: string | number | undefined, className?: string, style?: any, numberOfLines?: number }) => {
  const [formattedTime, setFormattedTime] = useState(formatTimeAgo(time));

  useEffect(() => {
    setFormattedTime(formatTimeAgo(time)); // Actualizar inmediatamente si la prop cambia

    const interval = setInterval(() => {
      setFormattedTime(formatTimeAgo(time));
    }, 60000); // 1 minuto

    return () => clearInterval(interval);
  }, [time]);

  return <Text className={className} style={style} numberOfLines={numberOfLines}>{formattedTime}</Text>;
};