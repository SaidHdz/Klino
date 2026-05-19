export const formatTimeAgo = (timestamp: number | string | undefined) => {
  if (!timestamp) return 'Justo ahora';
  
  let date: Date;
  if (typeof timestamp === 'string') {
     // Si es un string predefinido (mock) como 'Hoy, 10:42 AM', lo devolvemos tal cual
     if (isNaN(new Date(timestamp).getTime()) && isNaN(Number(timestamp))) {
         return timestamp;
     }
     date = new Date(isNaN(Number(timestamp)) ? timestamp : Number(timestamp));
  } else {
     date = new Date(timestamp);
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Justo ahora';
  if (diffMin === 1) return 'Hace 1 min';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHour === 1) return 'Hace 1 hora';
  if (diffHour < 24) return `Hace ${diffHour} horas`;
  if (diffDay === 1) return 'Ayer';
  return `Hace ${diffDay} días`;
};