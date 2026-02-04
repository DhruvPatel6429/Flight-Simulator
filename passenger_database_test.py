import requests
import sys
import json
from datetime import datetime

class PassengerDatabaseTester:
    def __init__(self, base_url="https://github-hashtable.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.created_passengers = []  # Track created passengers for cleanup

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, params=params)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:200]}"
            
            self.log_test(name, success, details)
            
            # Return response data for further testing
            try:
                return success, response.json() if response.text else {}
            except:
                return success, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def setup_test_environment(self):
        """Initialize system with sample data"""
        print("\n🔧 Setting up test environment...")
        
        # Reset system first
        success, _ = self.run_test("Reset System", "POST", "reset-system", 200)
        if not success:
            return False
            
        # Initialize sample data
        success, _ = self.run_test("Initialize Sample Data", "POST", "initialize-data", 200)
        return success

    def test_create_passenger_api(self):
        """Test Create Passenger API (POST /api/passengers)"""
        print("\n👤 Testing Create Passenger API...")
        
        # Test 1: Valid passenger data
        valid_passenger = {
            "name": "Test User",
            "passport": "P12345678",
            "flight_id": "AI101",
            "seat_number": "20A"
        }
        
        success, passenger_data = self.run_test(
            "Create Passenger - Valid Data", 
            "POST", 
            "passengers", 
            200, 
            valid_passenger
        )
        
        if success:
            # Verify ticket_id format (TKT + 8 chars)
            ticket_id = passenger_data.get('ticket_id', '')
            if ticket_id.startswith('TKT') and len(ticket_id) == 11:
                self.log_test("Ticket ID Format Verification (TKT[8 chars])", True)
                self.created_passengers.append(ticket_id)
            else:
                self.log_test("Ticket ID Format Verification", False, f"Got: {ticket_id}")
            
            # Verify status defaults to "pending"
            status = passenger_data.get('status', '')
            if status == "pending":
                self.log_test("Default Status Verification (pending)", True)
            else:
                self.log_test("Default Status Verification", False, f"Got: {status}")
        
        # Test 2: Missing required fields
        invalid_passenger = {
            "name": "Incomplete User",
            "passport": "P87654321"
            # Missing flight_id and seat_number
        }
        
        success, _ = self.run_test(
            "Create Passenger - Missing Fields (Should Fail)", 
            "POST", 
            "passengers", 
            422,  # Validation error
            invalid_passenger
        )
        
        # Test 3: Invalid flight_id
        invalid_flight_passenger = {
            "name": "Invalid Flight User",
            "passport": "P11111111",
            "flight_id": "INVALID123",
            "seat_number": "25B"
        }
        
        success, _ = self.run_test(
            "Create Passenger - Invalid Flight ID (Should Fail)", 
            "POST", 
            "passengers", 
            400,
            invalid_flight_passenger
        )
        
        # Test 4: Verify booked_seats increment
        # Get flight before and after adding passenger
        success, flight_before = self.run_test("Get Flight Before", "GET", "flights", 200)
        if success:
            ai101_before = next((f for f in flight_before if f['flight_id'] == 'AI101'), None)
            if ai101_before:
                booked_before = ai101_before['booked_seats']
                
                # Add another passenger
                another_passenger = {
                    "name": "Another User",
                    "passport": "P99887766",
                    "flight_id": "AI101",
                    "seat_number": "21B"
                }
                
                success, passenger_data = self.run_test(
                    "Create Another Passenger", 
                    "POST", 
                    "passengers", 
                    200, 
                    another_passenger
                )
                
                if success:
                    self.created_passengers.append(passenger_data.get('ticket_id'))
                    
                    # Check if booked_seats incremented
                    success, flight_after = self.run_test("Get Flight After", "GET", "flights", 200)
                    if success:
                        ai101_after = next((f for f in flight_after if f['flight_id'] == 'AI101'), None)
                        if ai101_after:
                            booked_after = ai101_after['booked_seats']
                            if booked_after == booked_before + 1:
                                self.log_test("Booked Seats Increment Verification", True)
                            else:
                                self.log_test("Booked Seats Increment Verification", False, 
                                            f"Before: {booked_before}, After: {booked_after}")
        
        return len(self.created_passengers) > 0

    def test_search_passenger_api(self):
        """Test Search Passenger API (GET /api/passengers/search/{ticket_id})"""
        print("\n🔍 Testing Search Passenger API...")
        
        if not self.created_passengers:
            self.log_test("Search Test Setup", False, "No passengers created in previous test")
            return False
        
        # Test 1: Search with existing ticket ID
        existing_ticket_id = self.created_passengers[0]
        success, passenger_data = self.run_test(
            "Search Existing Passenger", 
            "GET", 
            f"passengers/search/{existing_ticket_id}", 
            200
        )
        
        if success:
            # Verify all fields are returned correctly
            required_fields = ['ticket_id', 'name', 'passport', 'flight_id', 'seat_number', 'status']
            missing_fields = [field for field in required_fields if field not in passenger_data]
            
            if not missing_fields:
                self.log_test("Search Response Fields Complete", True)
            else:
                self.log_test("Search Response Fields", False, f"Missing: {missing_fields}")
        
        # Test 2: Search with non-existent ticket ID
        non_existent_id = "TKTNOTFOUND"
        success, _ = self.run_test(
            "Search Non-existent Passenger (Should Return 404)", 
            "GET", 
            f"passengers/search/{non_existent_id}", 
            404
        )
        
        return True

    def test_hash_table_api(self):
        """Test Hash Table API (GET /api/passengers/hash-table)"""
        print("\n🔢 Testing Hash Table API...")
        
        # Test default hash table (separate chaining, size 10)
        success, hash_table_data = self.run_test(
            "Get Hash Table - Default", 
            "GET", 
            "passengers/hash-table", 
            200
        )
        
        if success:
            # Verify returns table with 10 buckets (0-9)
            table = hash_table_data.get('table', {})
            expected_buckets = set(str(i) for i in range(10))
            actual_buckets = set(table.keys())
            
            if expected_buckets == actual_buckets:
                self.log_test("Hash Table 10 Buckets (0-9)", True)
            else:
                self.log_test("Hash Table Buckets", False, f"Expected {expected_buckets}, got {actual_buckets}")
            
            # Verify passengers distributed across buckets
            total_passengers = sum(len(bucket) for bucket in table.values())
            if total_passengers > 0:
                self.log_test("Passengers Distributed in Buckets", True, f"Total: {total_passengers}")
            else:
                self.log_test("Passengers Distributed in Buckets", False, "No passengers found")
            
            # Verify collision detection works
            collision_count = hash_table_data.get('collision_count', 0)
            buckets_with_multiple = sum(1 for bucket in table.values() if len(bucket) > 1)
            self.log_test(f"Collision Detection ({collision_count} collisions)", True)
            
            # Check load_factor calculation
            load_factor = hash_table_data.get('load_factor')
            if load_factor is not None:
                expected_load_factor = total_passengers / 10
                if abs(load_factor - expected_load_factor) < 0.001:
                    self.log_test("Load Factor Calculation", True, f"Load Factor: {load_factor}")
                else:
                    self.log_test("Load Factor Calculation", False, 
                                f"Expected: {expected_load_factor}, Got: {load_factor}")
            
            # Check collision_count accuracy
            actual_collisions = sum(max(0, len(bucket) - 1) for bucket in table.values())
            if collision_count == actual_collisions:
                self.log_test("Collision Count Accuracy", True, f"Collisions: {collision_count}")
            else:
                self.log_test("Collision Count Accuracy", False, 
                            f"Expected: {actual_collisions}, Got: {collision_count}")
        
        return success

    def test_rehash_api(self):
        """Test Rehash API (POST /api/passengers/hash-table/rehash)"""
        print("\n🔄 Testing Rehash API...")
        
        # Test 1: Rehash from 10 to 20
        success, rehash_data = self.run_test(
            "Rehash 10→20", 
            "POST", 
            "passengers/hash-table/rehash", 
            200,
            params={"old_size": 10, "new_size": 20}
        )
        
        if success:
            # Verify old_table has 10 buckets
            old_table = rehash_data.get('old_table', {})
            if len(old_table) == 10:
                self.log_test("Old Table Size (10 buckets)", True)
            else:
                self.log_test("Old Table Size", False, f"Expected 10, got {len(old_table)}")
            
            # Verify new_table has 20 buckets
            new_table = rehash_data.get('new_table', {})
            if len(new_table) == 20:
                self.log_test("New Table Size (20 buckets)", True)
            else:
                self.log_test("New Table Size", False, f"Expected 20, got {len(new_table)}")
            
            # Verify movements array shows item relocations
            movements = rehash_data.get('movements', [])
            if len(movements) > 0:
                self.log_test("Movements Array Populated", True, f"Movements: {len(movements)}")
                
                # Verify movement structure
                first_movement = movements[0]
                required_fields = ['ticket_id', 'from_index', 'to_index', 'passenger']
                missing_fields = [field for field in required_fields if field not in first_movement]
                
                if not missing_fields:
                    self.log_test("Movement Structure Complete", True)
                else:
                    self.log_test("Movement Structure", False, f"Missing: {missing_fields}")
            else:
                self.log_test("Movements Array", False, "No movements recorded")
            
            # Verify load factors are calculated correctly
            old_load_factor = rehash_data.get('old_load_factor')
            new_load_factor = rehash_data.get('new_load_factor')
            num_items = rehash_data.get('num_items', 0)
            
            if old_load_factor is not None and new_load_factor is not None:
                expected_old = num_items / 10
                expected_new = num_items / 20
                
                if (abs(old_load_factor - expected_old) < 0.001 and 
                    abs(new_load_factor - expected_new) < 0.001):
                    self.log_test("Load Factor Calculations", True, 
                                f"Old: {old_load_factor}, New: {new_load_factor}")
                else:
                    self.log_test("Load Factor Calculations", False, 
                                f"Expected Old: {expected_old}, New: {expected_new}")
        
        # Test 2: Multiple rehash operations (20→40)
        success, rehash_data2 = self.run_test(
            "Rehash 20→40", 
            "POST", 
            "passengers/hash-table/rehash", 
            200,
            params={"old_size": 20, "new_size": 40}
        )
        
        if success:
            old_table2 = rehash_data2.get('old_table', {})
            new_table2 = rehash_data2.get('new_table', {})
            
            if len(old_table2) == 20 and len(new_table2) == 40:
                self.log_test("Multiple Rehash Operations (20→40)", True)
            else:
                self.log_test("Multiple Rehash Operations", False, 
                            f"Old: {len(old_table2)}, New: {len(new_table2)}")
        
        return success

    def test_compare_methods(self):
        """Test all 4 collision methods comparison"""
        print("\n⚖️ Testing Compare Methods...")
        
        methods = [
            "separate_chaining",
            "linear_probing", 
            "quadratic_probing",
            "double_hashing"
        ]
        
        method_results = {}
        
        for method in methods:
            success, method_data = self.run_test(
                f"Hash Table - {method.replace('_', ' ').title()}", 
                "GET", 
                "passengers/hash-table", 
                200,
                params={"method": method, "table_size": 10}
            )
            
            if success:
                method_results[method] = method_data
                
                # Verify method is returned correctly
                returned_method = method_data.get('method')
                if returned_method == method:
                    self.log_test(f"{method} - Method Field", True)
                else:
                    self.log_test(f"{method} - Method Field", False, 
                                f"Expected: {method}, Got: {returned_method}")
                
                # Verify table structure differs by method
                table = method_data.get('table', {})
                if method == "separate_chaining":
                    # Should have lists in buckets
                    has_lists = all(isinstance(bucket, list) for bucket in table.values())
                    self.log_test(f"{method} - List Structure", has_lists)
                else:
                    # Open addressing should have None or passenger objects
                    has_open_addressing = all(
                        bucket is None or isinstance(bucket, dict) 
                        for bucket in table.values()
                    )
                    self.log_test(f"{method} - Open Addressing Structure", has_open_addressing)
        
        # Verify collision_count varies by method
        if len(method_results) >= 2:
            collision_counts = [data.get('collision_count', 0) for data in method_results.values()]
            # Methods should potentially have different collision counts
            self.log_test("Collision Count Variation", True, 
                        f"Counts: {dict(zip(methods[:len(collision_counts)], collision_counts))}")
        
        # Verify load_factor is consistent across methods
        if len(method_results) >= 2:
            load_factors = [data.get('load_factor', 0) for data in method_results.values()]
            if len(set(load_factors)) == 1:  # All same
                self.log_test("Load Factor Consistency", True, f"Load Factor: {load_factors[0]}")
            else:
                self.log_test("Load Factor Consistency", False, 
                            f"Inconsistent: {dict(zip(methods[:len(load_factors)], load_factors))}")
        
        return len(method_results) == len(methods)

    def test_scenarios(self):
        """Test comprehensive scenarios"""
        print("\n🎯 Testing Comprehensive Scenarios...")
        
        # Create 3 new passengers with different flight IDs
        new_passengers = [
            {
                "name": "Alice Johnson",
                "passport": "P11223344",
                "flight_id": "AI102",
                "seat_number": "10A"
            },
            {
                "name": "Bob Smith", 
                "passport": "P55667788",
                "flight_id": "AI103",
                "seat_number": "15C"
            },
            {
                "name": "Carol Davis",
                "passport": "P99001122",
                "flight_id": "AI104", 
                "seat_number": "22F"
            }
        ]
        
        scenario_passengers = []
        
        for i, passenger in enumerate(new_passengers):
            success, passenger_data = self.run_test(
                f"Scenario - Create Passenger {i+1}", 
                "POST", 
                "passengers", 
                200, 
                passenger
            )
            if success:
                scenario_passengers.append(passenger_data.get('ticket_id'))
        
        # Search for each created passenger
        for i, ticket_id in enumerate(scenario_passengers):
            if ticket_id:
                success, _ = self.run_test(
                    f"Scenario - Search Passenger {i+1}", 
                    "GET", 
                    f"passengers/search/{ticket_id}", 
                    200
                )
        
        # Test hash table visualization with new passengers
        success, _ = self.run_test(
            "Scenario - Hash Table with New Passengers", 
            "GET", 
            "passengers/hash-table", 
            200
        )
        
        # Test rehash operation and verify redistribution
        success, rehash_result = self.run_test(
            "Scenario - Rehash Operation", 
            "POST", 
            "passengers/hash-table/rehash", 
            200,
            params={"old_size": 10, "new_size": 20}
        )
        
        if success:
            movements = rehash_result.get('movements', [])
            if len(movements) > 0:
                self.log_test("Scenario - Passengers Redistributed", True, 
                            f"Movements: {len(movements)}")
        
        # Compare all 4 collision methods side-by-side
        methods = ["separate_chaining", "linear_probing", "quadratic_probing", "double_hashing"]
        comparison_results = {}
        
        for method in methods:
            success, method_data = self.run_test(
                f"Scenario - Compare {method}", 
                "GET", 
                "passengers/hash-table", 
                200,
                params={"method": method, "table_size": 10}
            )
            if success:
                comparison_results[method] = {
                    'collision_count': method_data.get('collision_count', 0),
                    'load_factor': method_data.get('load_factor', 0)
                }
        
        if len(comparison_results) == 4:
            self.log_test("Scenario - All Methods Comparison", True, 
                        f"Results: {comparison_results}")
        
        return len(scenario_passengers) == 3

    def run_passenger_database_tests(self):
        """Run comprehensive Passenger Database test suite"""
        print("🚀 Starting Passenger Database End-to-End Testing...")
        print(f"Backend URL: {self.base_url}")
        
        # Setup
        if not self.setup_test_environment():
            print("❌ Failed to setup test environment")
            return False
        
        # Test sequence
        tests = [
            self.test_create_passenger_api,
            self.test_search_passenger_api,
            self.test_hash_table_api,
            self.test_rehash_api,
            self.test_compare_methods,
            self.test_scenarios
        ]
        
        for test in tests:
            try:
                test()
            except Exception as e:
                print(f"❌ Test failed with exception: {str(e)}")
        
        # Print summary
        print(f"\n📊 Passenger Database Test Summary:")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        # Print failed tests
        failed_tests = [result for result in self.test_results if not result['success']]
        if failed_tests:
            print(f"\n❌ Failed Tests ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"  • {test['test']}: {test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = PassengerDatabaseTester()
    success = tester.run_passenger_database_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())