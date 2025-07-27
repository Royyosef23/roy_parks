/**
 * דמו פשוט לבדיקת מערכת החניות
 * להפעיל עם: node demo-parking-claims.js
 */

const API_BASE = 'http://localhost:3001/api/v1';

// פונקציה לעשות HTTP requests
async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  console.log(`📡 ${options.method || 'GET'} ${url}`);
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    console.error('❌ Error:', data);
    throw new Error(`HTTP ${response.status}: ${data.message}`);
  }
  
  console.log('✅ Success:', data);
  return data;
}

async function demoFlow() {
  try {
    console.log('\n התחלת דמו למערכת החניות\n');

    // שלב 1: רישום משתמש חדש
    console.log(' שלב 1: רישום משתמש חדש');
    const registerResponse = await makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: `test-${Date.now()}@example.com`,
        password: 'Test123456',
        firstName: 'Test',
        lastName: 'Owner',
        phone: '0541234567',
        role: 'OWNER',
        buildingCode: 'PADOVA32'
      })
    });

    const token = registerResponse.data.token;
    console.log('🔑 Token:', token.substring(0, 20) + '...');

    // שלב 2: הגשת בקשה לחנייה
    console.log('\n📋 שלב 2: הגשת בקשה לחנייה');
    const claimResponse = await makeRequest('/parking-claims', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        floor: '-1',
        spotNumber: '15',
        additionalInfo: 'חנייה ליד המעלית'
      })
    });

    const claimId = claimResponse.data.claim.id;
    console.log(' Claim ID:', claimId);

    // שלב 3: בדיקת סטטוס הבקשה
    console.log('\n שלב 3: בדיקת סטטוס הבקשה');
    await makeRequest('/parking-claims/my-claim', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // שלב 4: קבלת כל הבקשות הממתינות
    console.log('\n שלב 4: רשימת בקשות ממתינות');
    await makeRequest('/parking-claims/pending', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // שלב 5: אישור הבקשה
    console.log('\n שלב 5: אישור הבקשה');
    await makeRequest(`/parking-claims/${claimId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('\n הדמו הסתיים בהצלחה! כעת יש לך חנייה במערכת.');
    console.log('כדי לראות את החנייה ב-Prisma Studio, פעל את:');
    console.log('   npx prisma studio');

  } catch (error) {
    console.error('\n שגיאה בדמו:', error.message);
  }
}

// הפעלת הדמו רק אם זה הקובץ הראשי
if (require.main === module) {
  demoFlow();
}

module.exports = { demoFlow, makeRequest };
