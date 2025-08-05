#!/usr/bin/env bun

import { AuthController } from "./src/controllers/auth.controller";
import { db } from "./src/db/init";

async function testAuth() {
  const authCtrl = new AuthController(db);
  
  console.log("Creating test user...");
  
  // Create a test user
  const testUser = await authCtrl.createUser("testuser@example.com", "password123");
  console.log("Test user created:", { id: testUser.id, email: testUser.email });
  
  console.log("\nTest user created successfully!");
  console.log("You can now test the API endpoints:");
  console.log("1. POST /v1/auth/login with:");
  console.log('   {"email": "testuser@example.com", "password": "password123"}');
  console.log("2. Use the returned JWT token to access protected endpoints");
  
  process.exit(0);
}

testAuth().catch(console.error);