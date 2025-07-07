// Backend/models/User.js
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

class User {
    constructor(db) {
        this.collection = db.collection('users');
        this.createIndexes();
    }

    async createIndexes() {
        await this.collection.createIndex({ email: 1 }, { unique: true });
        await this.collection.createIndex({ username: 1 }, { unique: true });
        await this.collection.createIndex({ organizationId: 1 });
        await this.collection.createIndex({ role: 1 });
    }

    async create(userData) {
        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        
        const user = {
            username: userData.username,
            email: userData.email,
            password: hashedPassword,
            role: userData.role || 'staff',
            organizationId: userData.organizationId || null, // null for super_admin
            permissions: userData.permissions || this.getDefaultPermissions(userData.role),
            profile: {
                name: userData.name || '',
                phone: userData.phone || '',
                avatar: userData.avatar || null
            },
            isActive: userData.isActive !== undefined ? userData.isActive : true,
            lastLogin: null,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await this.collection.insertOne(user);
        const { password, ...userWithoutPassword } = user;
        return { ...userWithoutPassword, _id: result.insertedId };
    }

    async findByEmail(email) {
        return await this.collection.findOne({ email });
    }

    async findByUsername(username) {
        return await this.collection.findOne({ username });
    }

    async findById(id) {
        return await this.collection.findOne({ _id: new ObjectId(id) });
    }

    async findByOrganization(organizationId, filter = {}) {
        return await this.collection.find({
            organizationId,
            ...filter
        }).toArray();
    }

    async findSuperAdmins() {
        return await this.collection.find({ role: 'super_admin' }).toArray();
    }

    async authenticate(email, password) {
        const user = await this.findByEmail(email);
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        // Update last login
        await this.collection.updateOne(
            { _id: user._id },
            { $set: { lastLogin: new Date() } }
        );

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async update(id, updateData) {
        // Hash password if it's being updated
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 12);
        }

        const result = await this.collection.updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: { 
                    ...updateData, 
                    updatedAt: new Date() 
                } 
            }
        );
        return result.modifiedCount > 0;
    }

    async delete(id) {
        const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }

    async updatePermissions(id, permissions) {
        const result = await this.collection.updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: { 
                    permissions,
                    updatedAt: new Date() 
                } 
            }
        );
        return result.modifiedCount > 0;
    }

    async toggleStatus(id) {
        const user = await this.findById(id);
        if (!user) return false;

        const result = await this.collection.updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: { 
                    isActive: !user.isActive,
                    updatedAt: new Date() 
                } 
            }
        );
        return result.modifiedCount > 0;
    }

    getDefaultPermissions(role) {
        const permissions = {
            super_admin: [
                'manage_organizations',
                'manage_all_users',
                'view_analytics',
                'manage_subscriptions',
                'system_config'
            ],
            school_admin: [
                'manage_students',
                'manage_content',
                'manage_school_users',
                'manage_admissions',
                'view_school_analytics',
                'manage_settings'
            ],
            staff: [
                'view_students',
                'manage_content',
                'view_analytics'
            ]
        };
        return permissions[role] || permissions.staff;
    }

    async getUserStats(organizationId = null) {
        const match = organizationId ? { organizationId } : {};
        
        const pipeline = [
            { $match: match },
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 },
                    active: {
                        $sum: {
                            $cond: [{ $eq: ['$isActive', true] }, 1, 0]
                        }
                    }
                }
            }
        ];
        return await this.collection.aggregate(pipeline).toArray();
    }

    async getRecentUsers(organizationId = null, limit = 10) {
        const match = organizationId ? { organizationId } : {};
        
        return await this.collection
            .find(match)
            .sort({ createdAt: -1 })
            .limit(limit)
            .project({ password: 0 }) // Exclude password
            .toArray();
    }

    hasPermission(user, permission) {
        return user.permissions && user.permissions.includes(permission);
    }

    canAccessOrganization(user, organizationId) {
        // Super admin can access any organization
        if (user.role === 'super_admin') return true;
        
        // Users can only access their own organization
        return user.organizationId === organizationId;
    }
}

module.exports = User;
