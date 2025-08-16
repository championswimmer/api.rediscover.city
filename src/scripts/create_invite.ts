#!/usr/bin/env bun

import { db } from "../db/init";
import { InviteController } from "../controllers/invite.controller";

async function createInvite() {
  const email = process.argv[2];
  
  if (!email) {
    console.error("Error: Email address is required");
    console.error("Usage: bun run create_invite user@email.com");
    process.exit(1);
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error("Error: Invalid email address format");
    process.exit(1);
  }

  try {
    const inviteCtrl = new InviteController(db);
    const invite = await inviteCtrl.createInvite(email);
    
    console.log(`✅ Invite created successfully!`);
    console.log(`Email: ${invite.email}`);
    console.log(`Code: ${invite.code}`);
    console.log(`Created: ${invite.createdAt}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ Error: ${error.message}`);
    } else {
      console.error("❌ An unexpected error occurred");
    }
    process.exit(1);
  }
}

createInvite();