/**
 * Web App API Tests
 * These tests can be run with TestSprite MCP or manually with a test runner
 */

const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const TEST_PHONE = '9876543210';
const TEST_PASSWORD = 'testpassword123';
const TEST_BUSINESS_NAME = 'Test Business';

let authToken: string | null = null;

describe('Kada Ledger Web App - API Tests', () => {
  
  describe('Authentication', () => {
    test('POST /api/auth/register - Should register new vendor', async () => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: TEST_BUSINESS_NAME,
          phoneNumber: `9${Date.now().toString().slice(-9)}`, // Unique phone
          password: TEST_PASSWORD
        })
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.access_token).toBeDefined();
      expect(data.vendor).toBeDefined();
      authToken = data.access_token;
    });

    test('POST /api/auth/login - Should login with valid credentials', async () => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: TEST_PHONE,
          password: TEST_PASSWORD
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        expect(data.access_token).toBeDefined();
        authToken = data.access_token;
      }
    });

    test('POST /api/auth/login - Should reject invalid credentials', async () => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: '0000000000',
          password: 'wrongpassword'
        })
      });
      
      expect(response.status).toBe(401);
    });
  });

  describe('Customer Management', () => {
    beforeEach(() => {
      if (!authToken) {
        throw new Error('Authentication required');
      }
    });

    test('GET /api/customers - Should fetch all customers', async () => {
      const response = await fetch(`${API_URL}/customers`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(response.status).toBe(200);
      const customers = await response.json();
      expect(Array.isArray(customers)).toBe(true);
    });

    test('POST /api/customers - Should create new customer', async () => {
      const response = await fetch(`${API_URL}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: 'Test Customer',
          phoneNumber: `9${Date.now().toString().slice(-9)}`
        })
      });
      
      expect(response.status).toBe(200);
      const customer = await response.json();
      expect(customer.name).toBe('Test Customer');
      expect(customer.id).toBeDefined();
    });

    test('POST /api/customers - Should reject duplicate phone number', async () => {
      const phoneNumber = `9${Date.now().toString().slice(-9)}`;
      
      // Create first customer
      await fetch(`${API_URL}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: 'First Customer',
          phoneNumber
        })
      });
      
      // Try to create duplicate
      const response = await fetch(`${API_URL}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: 'Second Customer',
          phoneNumber
        })
      });
      
      expect(response.status).toBe(400);
    });

    test('POST /api/customers - Should require name or phone', async () => {
      const response = await fetch(`${API_URL}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({})
      });
      
      expect(response.status).toBe(400);
    });
  });

  describe('Transactions', () => {
    let customerId: string;

    beforeAll(async () => {
      if (!authToken) return;
      
      // Create a test customer
      const response = await fetch(`${API_URL}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: 'Transaction Test Customer',
          phoneNumber: `9${Date.now().toString().slice(-9)}`
        })
      });
      
      const customer = await response.json();
      customerId = customer.id;
    });

    test('POST /api/transactions - Should create transaction', async () => {
      const response = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          customerId,
          type: 'CREDIT',
          amount: 1000,
          description: 'Test transaction'
        })
      });
      
      expect(response.status).toBe(200);
      const transaction = await response.json();
      expect(transaction.amount).toBe(1000);
      expect(transaction.type).toBe('CREDIT');
    });

    test('GET /api/transactions - Should fetch all transactions', async () => {
      const response = await fetch(`${API_URL}/transactions`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(response.status).toBe(200);
      const transactions = await response.json();
      expect(Array.isArray(transactions)).toBe(true);
    });
  });

  describe('Vendor Profile', () => {
    test('GET /api/vendor/profile - Should fetch vendor profile', async () => {
      const response = await fetch(`${API_URL}/vendor/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(response.status).toBe(200);
      const profile = await response.json();
      expect(profile.phoneNumber).toBeDefined();
    });

    test('PATCH /api/vendor/profile - Should update profile', async () => {
      const response = await fetch(`${API_URL}/vendor/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          businessName: 'Updated Business Name'
        })
      });
      
      expect(response.status).toBe(200);
      const profile = await response.json();
      expect(profile.businessName).toBe('Updated Business Name');
    });
  });

  describe('Dashboard', () => {
    test('GET /api/vendor/dashboard - Should fetch dashboard data', async () => {
      const response = await fetch(`${API_URL}/vendor/dashboard`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(response.status).toBe(200);
      const dashboard = await response.json();
      expect(dashboard).toBeDefined();
    });
  });

  describe('Analytics', () => {
    test('GET /api/analytics - Should fetch analytics data', async () => {
      const response = await fetch(`${API_URL}/analytics`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(response.status).toBe(200);
      const analytics = await response.json();
      expect(analytics).toBeDefined();
    });
  });

  describe('Authorization', () => {
    test('Should reject requests without token', async () => {
      const response = await fetch(`${API_URL}/customers`);
      expect(response.status).toBe(401);
    });

    test('Should reject requests with invalid token', async () => {
      const response = await fetch(`${API_URL}/customers`, {
        headers: {
          'Authorization': 'Bearer invalid_token'
        }
      });
      expect(response.status).toBe(401);
    });
  });
});
