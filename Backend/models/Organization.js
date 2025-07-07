// Backend/models/Organization.js
const { ObjectId } = require('mongodb');

class Organization {
    constructor(db) {
        this.collection = db.collection('organizations');
        this.createIndexes();
    }

    async createIndexes() {
        // Ensure unique organizationId
        await this.collection.createIndex({ organizationId: 1 }, { unique: true });
        await this.collection.createIndex({ domain: 1 }, { unique: true, sparse: true });
        await this.collection.createIndex({ 'subscription.status': 1 });
    }

    async create(organizationData) {
        const organization = {
            organizationId: this.generateOrgId(organizationData.name),
            name: organizationData.name,
            domain: organizationData.domain || null,
            settings: {
                theme: organizationData.theme || 'blue',
                logo: organizationData.logo || null,
                contact: organizationData.contact || {},
                address: organizationData.address || {},
                ...organizationData.settings
            },
            subscription: {
                plan: organizationData.plan || 'basic',
                status: 'active',
                expiresAt: organizationData.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
                features: this.getPlanFeatures(organizationData.plan || 'basic')
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await this.collection.insertOne(organization);
        return { ...organization, _id: result.insertedId };
    }

    async findByOrganizationId(organizationId) {
        return await this.collection.findOne({ organizationId });
    }

    async findByDomain(domain) {
        return await this.collection.findOne({ domain });
    }

    async findAll(filter = {}) {
        return await this.collection.find(filter).toArray();
    }

    async update(organizationId, updateData) {
        const result = await this.collection.updateOne(
            { organizationId },
            { 
                $set: { 
                    ...updateData, 
                    updatedAt: new Date() 
                } 
            }
        );
        return result.modifiedCount > 0;
    }

    async delete(organizationId) {
        // Note: This should also clean up all related data
        const result = await this.collection.deleteOne({ organizationId });
        return result.deletedCount > 0;
    }

    async updateSubscription(organizationId, subscriptionData) {
        const result = await this.collection.updateOne(
            { organizationId },
            { 
                $set: { 
                    'subscription': subscriptionData,
                    updatedAt: new Date() 
                } 
            }
        );
        return result.modifiedCount > 0;
    }

    generateOrgId(name) {
        // Create a URL-friendly organization ID
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 50) + '_' + Date.now().toString().slice(-6);
    }

    getPlanFeatures(plan) {
        const features = {
            basic: ['students', 'contacts', 'basic_gallery'],
            premium: ['students', 'contacts', 'gallery', 'events', 'news', 'faculty', 'admissions'],
            enterprise: ['students', 'contacts', 'gallery', 'events', 'news', 'faculty', 'admissions', 'custom_domain', 'api_access', 'advanced_analytics']
        };
        return features[plan] || features.basic;
    }

    async getActiveOrganizations() {
        return await this.collection.find({
            'subscription.status': 'active',
            'subscription.expiresAt': { $gt: new Date() }
        }).toArray();
    }

    async getOrganizationStats() {
        const pipeline = [
            {
                $group: {
                    _id: '$subscription.plan',
                    count: { $sum: 1 },
                    active: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$subscription.status', 'active'] },
                                        { $gt: ['$subscription.expiresAt', new Date()] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ];
        return await this.collection.aggregate(pipeline).toArray();
    }
}

module.exports = Organization;
