const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkOrganization() {
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        const db = client.db();
        
        const org = await db.collection('organizations').findOne({ organizationId: 'new_holy_cross_school' });
        console.log('✅ New Holy Cross Organization:');
        console.log(JSON.stringify(org, null, 2));
        
        const users = await db.collection('users').find({ organizationId: 'new_holy_cross_school' }).toArray();
        console.log('\n✅ New Holy Cross Users:');
        users.forEach(user => {
            console.log(`- ${user.email} (${user.role})`);
        });

        // Check some sample data
        const programs = await db.collection('programs').find({ organizationId: 'new_holy_cross_school' }).toArray();
        console.log(`\n✅ Programs: ${programs.length} items`);

        const students = await db.collection('students').find({ organizationId: 'new_holy_cross_school' }).toArray();
        console.log(`✅ Students: ${students.length} items`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
    }
}

checkOrganization();
