const ALLOWED_KEYS = ['lastSelectedPhase'];
const MAX_STORAGE_SIZE = 1024 * 1024; // 1MB limit
const VALUE_HUB_PREFIX = 'valuehub';

export function cleanupLocalStorage(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const keysToRemove: string[] = [];
    let totalSize = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      
      const value = localStorage.getItem(key) || '';
      const itemSize = new Blob([key + value]).size;
      totalSize += itemSize;
      
      // Remove keys that are not in our allowed list or are old valuehub keys
      if (!ALLOWED_KEYS.includes(key)) {
        // Keep keys that might belong to other apps, only remove valuehub-related or oversized ones
        if (key.toLowerCase().includes(VALUE_HUB_PREFIX) || 
            key.startsWith('_t') || 
            key.includes('cache') ||
            key.includes('assessment') ||
            itemSize > 10240) { // Items larger than 10KB
          keysToRemove.push(key);
        }
      }
    }
    
    // If storage is getting full (>80% of limit), be more aggressive
    if (totalSize > MAX_STORAGE_SIZE * 0.8) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !ALLOWED_KEYS.includes(key)) {
          keysToRemove.push(key);
        }
      }
    }
    
    // Remove identified keys
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn('Failed to remove localStorage key:', key);
      }
    });
    
    if (keysToRemove.length > 0) {
      console.log(`Storage cleanup: removed ${keysToRemove.length} items`);
    }
  } catch (error) {
    console.warn('Storage cleanup failed:', error);
    // Last resort: clear everything except allowed keys
    try {
      const savedValues: Record<string, string> = {};
      ALLOWED_KEYS.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) savedValues[key] = value;
      });
      
      localStorage.clear();
      
      Object.entries(savedValues).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
    } catch (e) {
      console.error('Complete storage reset failed:', e);
    }
  }
}

export function safeSetItem(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    // Check if value is too large
    const size = new Blob([value]).size;
    if (size > 10240) { // 10KB limit per item
      console.warn(`Storage item "${key}" too large (${size} bytes), skipping`);
      return false;
    }
    
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    // If quota exceeded, run cleanup and retry once
    if ((error as Error).name === 'QuotaExceededError') {
      cleanupLocalStorage();
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (retryError) {
        console.error('Storage quota exceeded even after cleanup');
        return false;
      }
    }
    console.error('Storage setItem failed:', error);
    return false;
  }
}

export function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Storage getItem failed:', error);
    return null;
  }
}

export function initializeStorage(): void {
  cleanupLocalStorage();
}
