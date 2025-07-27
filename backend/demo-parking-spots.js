/**
 * Demo script לבדיקת מערכת הוספת חניות
 * 
 * הסקריפט הזה מדגים את כל התהליך:
 * 1. התחברות כמשתמש OWNER
 * 2. הוספת חנייה חדשה
 * 3. קבלת רשימת החניות שלי
 * 4. עדכון חנייה
 * 5. קבלת חניות זמינות
 */

const BASE_URL = 'http://localhost:3000/api/v1';

// הוספת פונקציה לשליחת בקשות HTTP
async function makeRequest(url, method = 'GET', data = null, token = null) {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);
    const result = await response.json();
    
    console.log(`\n🔵 ${method} ${url}`);
    console.log(`   Status: ${response.status}`);
    
    if (!response.ok) {
      console.log(`   ❌ Error:`, result);
      return null;
    }
    
    console.log(`   ✅ Success:`, result);
    return result;
  } catch (error) {
    console.log(`\n🔴 Network Error:`, error.message);
    return null;
  }
}

async function testParkingAPI() {
  console.log('🚀 Starting Parking API Demo\n');

  // 1. התחברות כמשתמש OWNER
  console.log('📋 Step 1: Login as OWNER');
  const loginResult = await makeRequest(`${BASE_URL}/auth/login`, 'POST', {
    email: 'owner@example.com',
    password: 'Owner123!'
  });

  if (!loginResult) {
    console.log('❌ Login failed - aborting demo');
    return;
  }

  const token = loginResult.data.token;
  console.log('✅ Login successful!');

  // 2. בדיקה אם יש בניין - אם לא, ניצור אחד
  console.log('\n📋 Step 2: Check/Create Building');
  const myBuildings = await makeRequest(`${BASE_URL}/buildings/my-buildings`, 'GET', null, token);
  
  let buildingId;
  if (myBuildings && myBuildings.data.buildings.length > 0) {
    buildingId = myBuildings.data.buildings[0].id;
    console.log(`✅ Using existing building: ${buildingId}`);
  } else {
    // יצירת בניין חדש
    const newBuilding = await makeRequest(`${BASE_URL}/buildings`, 'POST', {
      name: 'בניין דמו',
      address: 'רחוב דמו 1, תל אביב',
      city: 'תל אביב',
      zipCode: '12345',
      description: 'בניין דמו לבדיקת מערכת החניות'
    }, token);

    if (newBuilding) {
      buildingId = newBuilding.data.building.id;
      console.log(`✅ Created new building: ${buildingId}`);
    } else {
      console.log('❌ Failed to create building - aborting demo');
      return;
    }
  }

  // 3. הוספת חנייה חדשה
  console.log('\n📋 Step 3: Add New Parking Spot');
  const newSpot = await makeRequest(`${BASE_URL}/parking-spots`, 'POST', {
    spotNumber: 'A-101',
    floor: '-1',
    size: 'REGULAR',
    type: 'GARAGE',
    description: 'חנייה נוחה קרוב למעלית',
    hourlyRate: 15,
    dailyRate: 80,
    buildingId: buildingId
  }, token);

  let spotId;
  if (newSpot) {
    spotId = newSpot.data.parkingSpot.id;
    console.log(`✅ Added parking spot: ${spotId}`);
  } else {
    console.log('❌ Failed to add parking spot');
  }

  // 4. קבלת רשימת החניות שלי
  console.log('\n📋 Step 4: Get My Parking Spots');
  await makeRequest(`${BASE_URL}/parking-spots/my-spots`, 'GET', null, token);

  // 5. עדכון החנייה (אם נוצרה בהצלחה)
  if (spotId) {
    console.log('\n📋 Step 5: Update Parking Spot');
    await makeRequest(`${BASE_URL}/parking-spots/${spotId}`, 'PUT', {
      hourlyRate: 18,
      dailyRate: 90,
      description: 'חנייה נוחה קרוב למעלית - מחיר מעודכן'
    }, token);
  }

  // 6. קבלת חניות זמינות (בלי טוקן - גישה ציבורית)
  console.log('\n📋 Step 6: Get Available Parking Spots (Public)');
  await makeRequest(`${BASE_URL}/parking-spots/available`, 'GET');

  // 7. קבלת חניות זמינות עם סינון לפי עיר
  console.log('\n📋 Step 7: Get Available Parking Spots in Tel Aviv');
  await makeRequest(`${BASE_URL}/parking-spots/available?city=תל אביב`, 'GET');

  console.log('\n🎉 Demo completed!');
}

// הרצת הדמו
testParkingAPI().catch(console.error);
