import unittest
import json
from api_server import app, db
from models import User, Fabric

class AdminApiTestCase(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        app.config['JWT_SECRET_KEY'] = 'super-secret-key' # Ensure key matches
        self.client = app.test_client()
        
        with app.app_context():
            db.create_all()
            
            # Create test data
            admin = User(email='admin@test.com', role='admin', company_name='Admin Corp')
            # Set password hash manually or use a helper if available, but for test simplicity we can just create user
            # However, login endpoint checks password hash. So we need to set it correctly.
            from werkzeug.security import generate_password_hash
            admin.password_hash = generate_password_hash('adminpass')
            
            mill = User(email='mill@test.com', role='manufacturer', company_name='Test Mill')
            db.session.add(admin)
            db.session.add(mill)
            db.session.commit()
            
            fabric = Fabric(
                ref='TEST-001',
                fabric_group='Test Group',
                fabrication='Test Fab',
                gsm=200, # Changed to int as per model definition
                width='60',
                composition='100% Cotton',
                status='PENDING_REVIEW',
                manufacturer_id=mill.id,
                meta_data={'Shrinkage': '5%'}
            )
            db.session.add(fabric)
            db.session.commit()
            self.fabric_id = fabric.id
            self.mill_id = mill.id

        # Login to get token
        login_resp = self.client.post('/api/auth/login', json={
            'email': 'admin@test.com',
            'password': 'adminpass'
        })
        self.token = json.loads(login_resp.data)['token']
        self.headers = {'Authorization': f'Bearer {self.token}'}

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def test_get_fabrics(self):
        response = self.client.get('/api/admin/fabrics?status=PENDING_REVIEW', headers=self.headers)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['ref'], 'TEST-001')

    def test_update_fabric(self):
        response = self.client.put(f'/api/admin/fabric/{self.fabric_id}', json={
            'status': 'LIVE',
            'meta_data': {'Shrinkage': '3%'}
        }, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        
        # Verify update
        with app.app_context():
            fabric = Fabric.query.get(self.fabric_id)
            self.assertEqual(fabric.status, 'LIVE')
            self.assertEqual(fabric.meta_data['Shrinkage'], '3%')

    def test_get_mills(self):
        response = self.client.get('/api/admin/mills', headers=self.headers)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['name'], 'Test Mill')

if __name__ == '__main__':
    unittest.main()
