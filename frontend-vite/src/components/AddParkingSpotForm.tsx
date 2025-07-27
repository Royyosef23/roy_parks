/**
 * AddParkingSpotForm - טופס הוספת חנייה
 * 
 * הרכיב הזה מחליף את הסימולציה הקודמת
 * ומריץ קריאה אמיתית לשרת
 */

import React, { useState, useEffect } from 'react';
import { parkingService } from '../services/parkingService';
import type { AddParkingSpotData, ParkingSpot } from '../services/parkingService';
import './AddParkingSpotForm.css';

interface Building {
  id: string;
  name: string;
  address: string;
}

interface AddParkingSpotFormProps {
  onSuccess?: (spot: ParkingSpot) => void;
  onCancel?: () => void;
}

export const AddParkingSpotForm: React.FC<AddParkingSpotFormProps> = ({ 
  onSuccess, 
  onCancel 
}) => {
  const [formData, setFormData] = useState<AddParkingSpotData>({
    spotNumber: '',
    floor: '-1',
    size: 'REGULAR',
    type: 'GARAGE',
    description: '',
    hourlyRate: 15,
    dailyRate: 80,
    buildingId: ''
  });

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // טעינת רשימת הבניינים של המשתמש
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        // TODO: יש להוסיף service לקבלת הבניינים
        // const result = await buildingService.getMyBuildings();
        // setBuildings(result.buildings);
        
        // לעת עתה - נתונים דמה
        setBuildings([
          { id: '1', name: 'פאדובה 32', address: 'פאדובה 32, תל אביב' }
        ]);
      } catch (err) {
        console.error('Failed to fetch buildings:', err);
      }
    };

    fetchBuildings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // המרת מחירים למספרים
    if (name === 'hourlyRate' || name === 'dailyRate') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // קריאה אמיתית לשרת במקום סימולציה
      const result = await parkingService.addParkingSpot(formData);
      
      // הודעת הצלחה
      alert('החניה נוספה בהצלחה!');
      
      // קריאה ל-callback אם קיים
      if (onSuccess) {
        onSuccess(result.parkingSpot);
      }

      // איפוס הטופס
      setFormData({
        spotNumber: '',
        floor: '-1',
        size: 'REGULAR',
        type: 'GARAGE',
        description: '',
        hourlyRate: 15,
        dailyRate: 80,
        buildingId: ''
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'שגיאה בהוספת החנייה';
      setError(errorMessage);
      alert(`שגיאה: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-parking-form">
      <h2>הוספת חנייה חדשה</h2>
      
      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* בחירת בניין */}
        <div className="form-group">
          <label htmlFor="buildingId">בניין:</label>
          <select
            id="buildingId"
            name="buildingId"
            value={formData.buildingId}
            onChange={handleChange}
            required
          >
            <option value="">בחר בניין</option>
            {buildings.map(building => (
              <option key={building.id} value={building.id}>
                {building.name} - {building.address}
              </option>
            ))}
          </select>
        </div>

        {/* מספר חנייה */}
        <div className="form-group">
          <label htmlFor="spotNumber">מספר חנייה:</label>
          <input
            type="text"
            id="spotNumber"
            name="spotNumber"
            value={formData.spotNumber}
            onChange={handleChange}
            placeholder="לדוגמה: A-15"
            required
          />
        </div>

        {/* קומה */}
        <div className="form-group">
          <label htmlFor="floor">קומה:</label>
          <select
            id="floor"
            name="floor"
            value={formData.floor}
            onChange={handleChange}
          >
            <option value="-3">קומה -3</option>
            <option value="-2">קומה -2</option>
            <option value="-1">קומה -1</option>
            <option value="0">קרקע</option>
            <option value="1">קומה 1</option>
          </select>
        </div>

        {/* גודל */}
        <div className="form-group">
          <label htmlFor="size">גודל חנייה:</label>
          <select
            id="size"
            name="size"
            value={formData.size}
            onChange={handleChange}
          >
            <option value="COMPACT">קטנה</option>
            <option value="REGULAR">רגילה</option>
            <option value="LARGE">גדולה</option>
          </select>
        </div>

        {/* סוג */}
        <div className="form-group">
          <label htmlFor="type">סוג חנייה:</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="GARAGE">מוסך סגור</option>
            <option value="COVERED">מקורה</option>
            <option value="OUTDOOR">חיצונית</option>
          </select>
        </div>

        {/* מחיר לשעה */}
        <div className="form-group">
          <label htmlFor="hourlyRate">מחיר לשעה (₪):</label>
          <input
            type="number"
            id="hourlyRate"
            name="hourlyRate"
            value={formData.hourlyRate}
            onChange={handleChange}
            min="1"
            max="1000"
            required
          />
        </div>

        {/* מחיר ליום */}
        <div className="form-group">
          <label htmlFor="dailyRate">מחיר ליום (₪):</label>
          <input
            type="number"
            id="dailyRate"
            name="dailyRate"
            value={formData.dailyRate}
            onChange={handleChange}
            min="1"
            max="10000"
            required
          />
        </div>

        {/* תיאור */}
        <div className="form-group">
          <label htmlFor="description">תיאור (אופציונלי):</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="תיאור החנייה, הנחיות גישה, וכד'"
            rows={3}
          />
        </div>

        {/* כפתורים */}
        <div className="form-actions">
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'מוסיף...' : 'הוסף חנייה'}
          </button>
          
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel}
              className="btn-secondary"
            >
              ביטול
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
