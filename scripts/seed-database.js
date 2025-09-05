const { MongoClient } = require('mongodb');

// MongoDB connection string - update this with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bike_violation_db';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'bike_violation';

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    console.log(`Using database: ${MONGODB_DB_NAME}`);
    
    const db = client.db(MONGODB_DB_NAME);
    
    // Clear existing data
    await db.collection('users').deleteMany({});
    await db.collection('cases').deleteMany({});
    await db.collection('queries').deleteMany({});
    await db.collection('query_responses').deleteMany({});
    await db.collection('query_attachments').deleteMany({});
    
    console.log('Cleared existing data');
    
    // Create test users
    const users = [
      {
        id: 'user-1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        numberPlate: 'ABC-123',
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        phoneNumber: '+1-555-0123',
        address: '123 Main St, City Center, NY 10001'
      },
      {
        id: 'user-2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: 'password123',
        numberPlate: 'XYZ-789',
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        phoneNumber: '+1-555-0456',
        address: '456 Oak Ave, Downtown, NY 10002'
      },
      {
        id: 'user-3',
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        password: 'password123',
        numberPlate: 'DEF-456',
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        phoneNumber: '+1-555-0789',
        address: '789 Pine St, Uptown, NY 10003'
      },
      {
        id: 'user-4',
        name: 'Sarah Wilson',
        email: 'sarah.wilson@example.com',
        password: 'password123',
        numberPlate: 'GHI-789',
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        phoneNumber: '+1-555-0124',
        address: '321 Elm St, Midtown, NY 10004'
      },
      {
        id: 'user-5',
        name: 'David Brown',
        email: 'david.brown@example.com',
        password: 'password123',
        numberPlate: 'JKL-012',
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        phoneNumber: '+1-555-0125',
        address: '654 Maple Ave, Brooklyn, NY 10005'
      },
      {
        id: 'admin-1',
        name: 'Admin User',
        email: 'admin@bikeviolation.com',
        password: 'admin123',
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        phoneNumber: '+1-555-0001',
        address: 'Admin Office, City Hall, NY 10000'
      }
    ];
    
    await db.collection('users').insertMany(users);
    console.log('Created test users');
    
    // Create test violations
    const violations = [
      {
        id: 'case-1',
        userId: 'user-1',
        violationType: 'no_helmet',
        violation: 'Cyclist observed riding without helmet on Main Street',
        fine: 50,
        proofUrl: '/uploads/images/placeholder-violation-1.jpg',
        location: 'Main Street & 5th Avenue, NY',
        date: new Date('2024-01-15T10:00:00Z').toISOString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dueDate: new Date('2024-02-15T10:00:00Z').toISOString(),
        officerId: 'admin-1'
      },
      {
        id: 'case-2',
        userId: 'user-2',
        violationType: 'traffic_light',
        violation: 'Ran red light at Broadway intersection',
        fine: 75,
        proofUrl: '/uploads/videos/placeholder-violation-2.mp4',
        location: 'Broadway & 42nd Street, NY',
        date: new Date('2024-01-14T14:30:00Z').toISOString(),
        status: 'paid',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dueDate: new Date('2024-02-14T14:30:00Z').toISOString(),
        paidAt: new Date('2024-01-20T09:00:00Z').toISOString(),
        officerId: 'admin-1'
      },
      {
        id: 'case-3',
        userId: 'user-3',
        violationType: 'parking',
        violation: 'Illegally parked in no-parking zone',
        fine: 100,
        proofUrl: '/uploads/images/placeholder-violation-3.jpg',
        location: 'Central Park West & 72nd Street, NY',
        date: new Date('2024-01-13T16:45:00Z').toISOString(),
        status: 'disputed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dueDate: new Date('2024-02-13T16:45:00Z').toISOString(),
        disputedAt: new Date('2024-01-18T11:00:00Z').toISOString(),
        officerId: 'admin-1'
      },
      {
        id: 'case-4',
        userId: 'user-4',
        violationType: 'speeding',
        violation: 'Exceeded speed limit in residential area',
        fine: 150,
        proofUrl: '/uploads/videos/placeholder-violation-4.mp4',
        location: 'Park Avenue & 34th Street, NY',
        date: new Date('2024-01-12T08:15:00Z').toISOString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dueDate: new Date('2024-02-12T08:15:00Z').toISOString(),
        officerId: 'admin-1'
      },
      {
        id: 'case-5',
        userId: 'user-5',
        violationType: 'wrong_lane',
        violation: 'Riding in wrong lane direction',
        fine: 80,
        proofUrl: '/uploads/images/placeholder-violation-5.jpg',
        location: 'Madison Avenue & 50th Street, NY',
        date: new Date('2024-01-11T12:20:00Z').toISOString(),
        status: 'resolved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dueDate: new Date('2024-02-11T12:20:00Z').toISOString(),
        resolvedAt: new Date('2024-01-25T15:30:00Z').toISOString(),
        officerId: 'admin-1'
      },
      {
        id: 'case-6',
        userId: 'user-1',
        violationType: 'mobile_use',
        violation: 'Using mobile phone while riding',
        fine: 60,
        proofUrl: '/uploads/images/placeholder-violation-6.jpg',
        location: 'Lexington Avenue & 59th Street, NY',
        date: new Date('2024-01-10T17:30:00Z').toISOString(),
        status: 'cancelled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dueDate: new Date('2024-02-10T17:30:00Z').toISOString(),
        officerId: 'admin-1'
      },
      {
        id: 'case-7',
        userId: 'user-2',
        violationType: 'other',
        violation: 'Riding on sidewalk in pedestrian area',
        fine: 50,
        proofUrl: '/uploads/videos/placeholder-violation-7.mp4',
        location: 'Times Square, NY',
        date: new Date('2024-01-09T13:45:00Z').toISOString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dueDate: new Date('2024-02-09T13:45:00Z').toISOString(),
        officerId: 'admin-1'
      }
    ];
    
    await db.collection('cases').insertMany(violations);
    console.log('Created test violations');
    
    // Create test queries
    const queries = [
      {
        id: 'query-1',
        userId: 'user-1',
        caseId: 'case-1',
        subject: 'Dispute about helmet violation',
        message: 'I was wearing a helmet but it was not visible in the photo. Please review the evidence.',
        category: 'violation_dispute',
        priority: 'high',
        status: 'open',
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responses: [],
        attachments: [],
        tags: ['dispute', 'evidence'],
        isUrgent: true
      },
      {
        id: 'query-2',
        userId: 'user-2',
        caseId: 'case-2',
        subject: 'Payment confirmation needed',
        message: 'I made the payment but the status still shows as pending. Please confirm receipt.',
        category: 'payment_issues',
        priority: 'medium',
        status: 'resolved',
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responses: [],
        attachments: [],
        tags: ['payment', 'confirmation'],
        isUrgent: false
      },
      {
        id: 'query-3',
        userId: 'user-3',
        subject: 'General inquiry about violation process',
        message: 'How long does it take to process a violation dispute? What documents do I need to submit?',
        category: 'general_inquiry',
        priority: 'low',
        status: 'open',
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responses: [],
        attachments: [],
        tags: ['process', 'dispute'],
        isUrgent: false
      }
    ];
    
    await db.collection('queries').insertMany(queries);
    console.log('Created test queries');
    
    console.log('Database seeding completed successfully!');
    console.log('\nTest Data Summary:');
    console.log('- Users: 6 (5 regular users + 1 admin)');
    console.log('- Violations: 7 (various statuses and types)');
    console.log('- Queries: 3 (different categories and priorities)');
    console.log('\nTest Credentials:');
    console.log('Admin: admin@bikeviolation.com / admin123');
    console.log('User 1: john.doe@example.com / password123');
    console.log('User 2: jane.smith@example.com / password123');
    console.log('User 3: mike.johnson@example.com / password123');
    console.log('User 4: sarah.wilson@example.com / password123');
    console.log('User 5: david.brown@example.com / password123');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedDatabase();
