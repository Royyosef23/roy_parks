/**
 * Parking Service - שירות לניהול חניות בצד הקליינט
 * 
 * הקובץ הזה מכיל את כל הקריאות ל-API של חניות
 */

import { useState } from 'react';

// Types עבור TypeScript
export interface ParkingSpot {
  id: string;
  spotNumber: string;
  floor?: number;
  size: 'COMPACT' | 'REGULAR' | 'LARGE';
  type: 'OUTDOOR' | 'COVERED' | 'GARAGE';
  description?: string;
  hourlyRate: number;
  dailyRate: number;
  available: boolean;
  building: {
    id: string;
    name: string;
    address: string;
    city: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AddParkingSpotData {
  spotNumber: string;
  floor?: string;
  size?: 'COMPACT' | 'REGULAR' | 'LARGE';
  type?: 'OUTDOOR' | 'COVERED' | 'GARAGE';
  description?: string;
  hourlyRate: number;
  dailyRate: number;
  buildingId: string;
}

export interface UpdateParkingSpotData {
  spotNumber?: string;
  floor?: string;
  size?: 'COMPACT' | 'REGULAR' | 'LARGE';
  type?: 'OUTDOOR' | 'COVERED' | 'GARAGE';
  description?: string;
  hourlyRate?: number;
  dailyRate?: number;
  available?: boolean;
}

// API Base URL - צריך להתאים לסביבה
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

/**
 * פונקציה עזר לשליחת בקשות HTTP
 */
async function makeRequest<T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any,
  requireAuth = true
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // הוספת טוקן אימות אם נדרש
  if (requireAuth) {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error);
    throw error;
  }
}

/**
 * שירותי Parking API
 */
export const parkingService = {
  /**
   * הוספת חנייה חדשה
   */
  async addParkingSpot(spotData: AddParkingSpotData): Promise<{ parkingSpot: ParkingSpot }> {
    return makeRequest('/parking-spots', 'POST', spotData);
  },

  /**
   * קבלת החניות שלי (עבור בעלי חניות)
   */
  async getMyParkingSpots(): Promise<{ spots: ParkingSpot[] }> {
    return makeRequest('/parking-spots/my-spots');
  },

  /**
   * קבלת חניות זמינות (גישה ציבורית)
   */
  async getAvailableParkingSpots(filters?: {
    city?: string;
    type?: string;
    size?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ spots: ParkingSpot[] }> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });
    }

    const endpoint = `/parking-spots/available${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return makeRequest(endpoint, 'GET', null, false);
  },

  /**
   * עדכון חנייה
   */
  async updateParkingSpot(spotId: string, updateData: UpdateParkingSpotData): Promise<{ parkingSpot: ParkingSpot }> {
    return makeRequest(`/parking-spots/${spotId}`, 'PUT', updateData);
  },

  /**
   * מחיקת חנייה
   */
  async deleteParkingSpot(spotId: string): Promise<void> {
    return makeRequest(`/parking-spots/${spotId}`, 'DELETE');
  }
};

/**
 * Hook עבור React לניהול חניות
 */
export function useParkingSpots() {
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMySpots = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await parkingService.getMyParkingSpots();
      setSpots(result.spots);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch parking spots');
    } finally {
      setLoading(false);
    }
  };

  const addSpot = async (spotData: AddParkingSpotData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await parkingService.addParkingSpot(spotData);
      setSpots((prev: ParkingSpot[]) => [result.parkingSpot, ...prev]);
      return result.parkingSpot;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add parking spot');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSpot = async (spotId: string, updateData: UpdateParkingSpotData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await parkingService.updateParkingSpot(spotId, updateData);
      setSpots((prev: ParkingSpot[]) => 
        prev.map((spot: ParkingSpot) => 
          spot.id === spotId ? result.parkingSpot : spot
        )
      );
      return result.parkingSpot;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update parking spot');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSpot = async (spotId: string) => {
    setLoading(true);
    setError(null);
    try {
      await parkingService.deleteParkingSpot(spotId);
      setSpots((prev: ParkingSpot[]) => prev.filter((spot: ParkingSpot) => spot.id !== spotId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete parking spot');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    spots,
    loading,
    error,
    fetchMySpots,
    addSpot,
    updateSpot,
    deleteSpot
  };
}
