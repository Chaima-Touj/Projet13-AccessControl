const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Badge = require('../models/Badge');
const Door = require('../models/Door');
const AccessLog = require('../models/AccessLog');
const { simulateAccess, detectSuspiciousActivity } = require('../services/accessService');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/projet13_access_control';

async function verify() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Check users
    const admin = await User.findOne({ email: 'ahmed.bensalah@universite.tn' });
    const student = await User.findOne({ email: 'marwen.gharbi@universite.tn' });
    console.log(`👤 Admin: ${admin ? 'OK' : 'MISSING'}`);
    console.log(`👤 Student: ${student ? 'OK' : 'MISSING'}`);

    // 2. Check a door
    const door = await Door.findOne({ code: 'BLOCA-MAIN' });
    console.log(`🚪 Door: ${door ? 'OK' : 'MISSING'}`);

    // 3. Simulate GRANTED access (Student at Main Door)
    const studentBadge = await Badge.findOne({ userId: student._id });
    const grantRes = await simulateAccess({
      badgeId: studentBadge.badgeId,
      doorId: door._id,
      simulatedBy: admin._id,
      ipAddress: '127.0.0.1'
    });
    console.log(`✅ Simulation (Granted): ${grantRes.result === 'granted' ? 'PASS' : 'FAIL'} (${grantRes.reason})`);

    // 4. Simulate DENIED access (Suspended user)
    const suspendedUser = await User.findOne({ status: 'suspended' });
    if (suspendedUser) {
      const suspendedBadge = await Badge.findOne({ userId: suspendedUser._id });
      const denyRes = await simulateAccess({
        badgeId: suspendedBadge.badgeId,
        doorId: door._id,
        simulatedBy: admin._id,
        ipAddress: '127.0.0.1'
      });
      console.log(`❌ Simulation (Denied - Suspended): ${denyRes.result === 'denied' && denyRes.reason === 'Utilisateur suspendu' ? 'PASS' : 'FAIL'} (${denyRes.reason})`);
    }

    // 5. Trigger SUSPICIOUS activity
    console.log('🛡️ Triggering suspicious activity...');
    const blockedBadge = await Badge.findOne({ status: 'blocked' });
    if (blockedBadge) {
      // Simulate 3 denials for blocked badge
      for (let i = 0; i < 3; i++) {
        await AccessLog.create({
          userId: blockedBadge.userId,
          badgeId: blockedBadge.badgeId,
          doorId: door._id,
          result: 'denied',
          reason: 'Badge bloqué',
          simulatedBy: admin._id,
          ipAddress: '127.0.0.1'
        });
      }
      const isSuspicious = await detectSuspiciousActivity(blockedBadge.badgeId);
      console.log(`🚨 Suspicious detection: ${isSuspicious ? 'PASS' : 'FAIL'}`);
    }

    // 6. Check logs creation
    const logsCount = await AccessLog.countDocuments();
    console.log(`📋 Total Logs: ${logsCount}`);

    await mongoose.connection.close();
    console.log('✅ Verification complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during verification:', error);
    process.exit(1);
  }
}

verify();
