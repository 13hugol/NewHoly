// Test script to verify the multi-tenant authentication and data access
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testLogin() {
    console.log('🧪 Testing Multi-tenant Authentication...\n');
    
    // Test 1: Super Admin Login
    console.log('1️⃣ Testing Super Admin Login');
    try {
        const response = await fetch(`${BASE_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'superadmin@schoolsaas.com',
                password: 'SuperAdmin2025!'
            })
        });
        
        const result = await response.json();
        if (response.ok) {
            console.log('   ✅ Super Admin login successful');
            console.log('   🔑 Token received:', result.token.substring(0, 20) + '...');
        } else {
            console.log('   ❌ Super Admin login failed:', result.message);
        }
    } catch (error) {
        console.log('   ❌ Error testing Super Admin login:', error.message);
    }
    
    console.log('');
    
    // Test 2: School Admin Login
    console.log('2️⃣ Testing School Admin Login (New Holy Cross)');
    try {
        const response = await fetch(`${BASE_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@newholy.edu.np',
                password: 'NewHoly2025!'
            })
        });
        
        const result = await response.json();
        if (response.ok) {
            console.log('   ✅ School Admin login successful');
            console.log('   🔑 Token received:', result.token.substring(0, 20) + '...');
            
            // Test accessing data with this token
            console.log('\n   📊 Testing data access...');
            const dataResponse = await fetch(`${BASE_URL}/api/programs`, {
                headers: {
                    'Authorization': `Bearer ${result.token}`,
                    'X-Organization-Id': 'new_holy_cross_school'
                }
            });
            
            if (dataResponse.ok) {
                const data = await dataResponse.json();
                console.log(`   ✅ Data access successful: ${data.data.length} programs found`);
            } else {
                console.log('   ❌ Data access failed:', dataResponse.status);
            }
            
        } else {
            console.log('   ❌ School Admin login failed:', result.message);
        }
    } catch (error) {
        console.log('   ❌ Error testing School Admin login:', error.message);
    }
    
    console.log('');
    
    // Test 3: Super Admin Dashboard Access
    console.log('3️⃣ Testing Super Admin Dashboard Access');
    try {
        const loginResponse = await fetch(`${BASE_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'superadmin@schoolsaas.com',
                password: 'SuperAdmin2025!'
            })
        });
        
        const loginResult = await loginResponse.json();
        if (loginResponse.ok) {
            const dashboardResponse = await fetch(`${BASE_URL}/api/super-admin/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${loginResult.token}`
                }
            });
            
            if (dashboardResponse.ok) {
                const dashboardData = await dashboardResponse.json();
                console.log('   ✅ Super Admin dashboard access successful');
                console.log('   📈 Dashboard data:', {
                    totalOrganizations: dashboardData.overview?.totalOrganizations || 0,
                    activeOrganizations: dashboardData.overview?.activeOrganizations || 0,
                    totalUsers: dashboardData.overview?.totalUsers || 0
                });
            } else {
                console.log('   ❌ Dashboard access failed:', dashboardResponse.status);
            }
        }
    } catch (error) {
        console.log('   ❌ Error testing Super Admin dashboard:', error.message);
    }
    
    console.log('\n🎉 Testing complete!');
}

testLogin();
