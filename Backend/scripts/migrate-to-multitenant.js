// Backend/scripts/migrate-to-multitenant.js
// Migration script to convert existing NewHoly database to multi-tenant structure

const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in environment variables');
    process.exit(1);
}

async function migrateToMultiTenant() {
    console.log('🚀 Starting migration to multi-tenant structure...\n');
    
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        const db = client.db();
        
        // Step 1: Create the organizations collection
        console.log('📝 Step 1: Creating organizations collection...');
        
        // Check if organization already exists
        const existingOrg = await db.collection('organizations').findOne({ organizationId: 'new_holy_cross_school' });
        
        if (!existingOrg) {
            const organizationData = {
                organizationId: 'new_holy_cross_school',
                name: 'New Holy Cross School',
                domain: null, // You can set this later
                settings: {
                    theme: 'blue',
                    logo: '/Images/Logo.svg',
                    contact: {
                        phone: '+977-XXX-XXXX',
                        email: 'info@newholy.edu.np'
                    },
                    address: {
                        street: 'Kageshwori Manohara-09',
                        city: 'Kathmandu',
                        country: 'Nepal'
                    }
                },
                subscription: {
                    plan: 'premium',
                    status: 'active',
                    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
                    features: ['students', 'contacts', 'gallery', 'events', 'news', 'faculty', 'admissions']
                },
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            await db.collection('organizations').insertOne(organizationData);
            console.log('✅ Organization created: New Holy Cross School');
        } else {
            console.log('ℹ️  Organization already exists: New Holy Cross School');
        }
        
        // Step 2: Create users collection and migrate existing admin
        console.log('\n📝 Step 2: Creating users collection...');
        
        // Create super admin user (you)
        const superAdminPassword = 'SuperAdmin2025!'; // Change this!
        const existingSuperAdmin = await db.collection('users').findOne({ email: 'superadmin@schoolsaas.com' });
        
        if (!existingSuperAdmin) {
            const hashedSuperPassword = await bcrypt.hash(superAdminPassword, 12);
            
            const superAdmin = {
                username: 'superadmin@schoolsaas.com',
                email: 'superadmin@schoolsaas.com',
                password: hashedSuperPassword,
                role: 'super_admin',
                organizationId: null,
                permissions: ['manage_organizations', 'manage_all_users', 'view_analytics', 'manage_subscriptions', 'system_config'],
                profile: {
                    name: 'Super Administrator',
                    phone: '',
                    avatar: null
                },
                isActive: true,
                lastLogin: null,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            await db.collection('users').insertOne(superAdmin);
            console.log('✅ Super admin user created: superadmin@schoolsaas.com');
            console.log(`🔑 Super admin password: ${superAdminPassword}`);
        } else {
            console.log('ℹ️  Super admin already exists: superadmin@schoolsaas.com');
        }
        
        // Create school admin for New Holy Cross
        const schoolAdminPassword = 'NewHoly2025!'; // Change this!
        const existingSchoolAdmin = await db.collection('users').findOne({ email: 'admin@newholy.edu.np' });
        
        if (!existingSchoolAdmin) {
            const hashedSchoolPassword = await bcrypt.hash(schoolAdminPassword, 12);
            
            const schoolAdmin = {
                username: 'admin@newholy.edu.np',
                email: 'admin@newholy.edu.np',
                password: hashedSchoolPassword,
                role: 'school_admin',
                organizationId: 'new_holy_cross_school',
                permissions: ['manage_students', 'manage_content', 'manage_school_users', 'manage_admissions', 'view_school_analytics', 'manage_settings'],
                profile: {
                    name: 'School Administrator',
                    phone: '',
                    avatar: null
                },
                isActive: true,
                lastLogin: null,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            await db.collection('users').insertOne(schoolAdmin);
            console.log('✅ School admin user created: admin@newholy.edu.np');
            console.log(`🔑 School admin password: ${schoolAdminPassword}`);
        } else {
            console.log('ℹ️  School admin already exists: admin@newholy.edu.np');
        }
        
        // Step 3: Add organizationId to existing collections
        console.log('\n📝 Step 3: Adding organizationId to existing collections...');
        
        const collectionsToMigrate = [
            'students',
            'programs', 
            'contacts',
            'news_events',
            'testimonials',
            'faculty',
            'quick_links',
            'gallery'
        ];
        
        for (const collectionName of collectionsToMigrate) {
            const collection = db.collection(collectionName);
            const count = await collection.countDocuments();
            
            if (count > 0) {
                const result = await collection.updateMany(
                    { organizationId: { $exists: false } },
                    { $set: { organizationId: 'new_holy_cross_school' } }
                );
                console.log(`✅ Updated ${result.modifiedCount} documents in ${collectionName}`);
            } else {
                console.log(`ℹ️  Collection ${collectionName} is empty, skipping...`);
            }
        }
        
        // Step 4: Create indexes for better performance
        console.log('\n📝 Step 4: Creating database indexes...');
        
        // Helper function to create index safely
        const createIndexSafely = async (collection, indexSpec, options = {}) => {
            try {
                await collection.createIndex(indexSpec, options);
                return true;
            } catch (error) {
                if (error.code === 85) { // Index already exists
                    return false;
                }
                throw error;
            }
        };
        
        // Organization indexes
        const orgCollection = db.collection('organizations');
        await createIndexSafely(orgCollection, { organizationId: 1 }, { unique: true });
        await createIndexSafely(orgCollection, { domain: 1 }, { unique: true, sparse: true });
        console.log('✅ Organization indexes created');
        
        // User indexes
        const userCollection = db.collection('users');
        await createIndexSafely(userCollection, { email: 1 }, { unique: true });
        await createIndexSafely(userCollection, { username: 1 }, { unique: true });
        await createIndexSafely(userCollection, { organizationId: 1 });
        await createIndexSafely(userCollection, { role: 1 });
        console.log('✅ User indexes created');
        
        // Add organizationId indexes to all collections
        for (const collectionName of collectionsToMigrate) {
            await createIndexSafely(db.collection(collectionName), { organizationId: 1 });
            console.log(`✅ OrganizationId index created for ${collectionName}`);
        }
        
        console.log('\n🎉 Migration completed successfully!');
        console.log('\n📋 SUMMARY:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Organizations collection created');
        console.log('✅ Users collection created with role-based access');
        console.log('✅ All existing data migrated to multi-tenant structure');
        console.log('✅ Database indexes created for performance');
        console.log('\n🔐 LOGIN CREDENTIALS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Super Admin:');
        console.log(`  Email: superadmin@schoolsaas.com`);
        console.log(`  Password: ${superAdminPassword}`);
        console.log(`  Access: http://localhost:3000/super-admin.html`);
        console.log('');
        console.log('School Admin (New Holy Cross):');
        console.log(`  Email: admin@newholy.edu.np`);
        console.log(`  Password: ${schoolAdminPassword}`);
        console.log(`  Access: http://localhost:3000/admin.html`);
        console.log('\n⚠️  IMPORTANT: Change these default passwords immediately!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await client.close();
    }
}

// Run migration
if (require.main === module) {
    migrateToMultiTenant()
        .then(() => {
            console.log('\n🎯 Migration process completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Migration failed:', error);
            process.exit(1);
        });
}

module.exports = { migrateToMultiTenant };
