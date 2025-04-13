export const debug = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Client Debug]', ...args);
  }
};

// Optional: Add specific debug functions for different areas
export const debugEvents = (...args: any[]) => debug('[Events]', ...args);
export const debugAPI = (...args: any[]) => debug('[API]', ...args);
export const debugUI = (...args: any[]) => debug('[UI]', ...args);