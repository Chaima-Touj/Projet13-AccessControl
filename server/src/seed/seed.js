require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('../models/User');
const Badge = require('../models/Badge');
const Building = require('../models/Building');
const Door = require('../models/Door');
const Permission = require('../models/Permission');
const AccessLog = require('../models/AccessLog');
const Incident = require('../models/Incident');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/projet13_access_control';

const generateBadgeId = (prefix, index) => `${prefix}-${Date.now().toString(36).toUpperCase()}-${String(index).padStart(3, '0')}`;

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Connected to MongoDB');

    // Clear all collections
    await Promise.all([
      User.deleteMany({}), Badge.deleteMany({}), Building.deleteMany({}),
      Door.deleteMany({}), Permission.deleteMany({}), AccessLog.deleteMany({}),
      Incident.deleteMany({})
    ]);
    console.log('🗑️  Collections cleared');

    // ── USERS ─────────────────────────────────────────────────────
    const usersData = [
      { fullName: 'Ahmed Ben Salah', email: 'ahmed.bensalah@universite.tn', password: 'Admin123!', role: 'admin', department: 'Informatique' },
      { fullName: 'Yasmine Trabelsi', email: 'yasmine.trabelsi@universite.tn', password: 'Security123!', role: 'security', department: 'Securite' },
      { fullName: 'Marwen Gharbi', email: 'marwen.gharbi@universite.tn', password: 'Student123!', role: 'student', department: 'Informatique' },
      { fullName: 'Amira Jebali', email: 'amira.jebali@universite.tn', password: 'Teacher123!', role: 'teacher', department: 'Sciences' },
      { fullName: 'Rahma Ben Ahmed', email: 'rahma.benahmed@universite.tn', password: 'Student123!', role: 'student', department: 'Mathematiques' },
      { fullName: 'Seif Mzoughi', email: 'seif.mzoughi@universite.tn', password: 'Student123!', role: 'student', department: 'Physique' },
      { fullName: 'Ons Chaari', email: 'ons.chaari@universite.tn', password: 'Teacher123!', role: 'teacher', department: 'Informatique' },
      { fullName: 'Aziz Hammami', email: 'aziz.hammami@universite.tn', password: 'Student123!', role: 'student', department: 'Chimie', status: 'suspended' },
    ];

    const users = await User.create(usersData);
    const adminUser = users.find(u => u.role === 'admin');
    const securityUser = users.find(u => u.role === 'security');
    const studentUser = users.find(u => u.email === 'marwen.gharbi@universite.tn');
    const teacherUser = users.find(u => u.email === 'amira.jebali@universite.tn');
    console.log(`👤 ${users.length} utilisateurs créés`);

    // ── BUILDINGS ─────────────────────────────────────────────────
    const buildingsData = [
      { name: 'Bloc A', code: 'BLOCA', description: 'Bâtiment principal - Cours et amphithéâtres', status: 'active' },
      { name: 'Bloc B', code: 'BLOCB', description: 'Bâtiment secondaire - Salles de TD', status: 'active' },
      { name: 'Bibliothèque', code: 'BIBLIO', description: 'Bibliothèque universitaire centrale', status: 'active' },
      { name: 'Laboratoire Informatique', code: 'LABINFO', description: 'Salles de TP informatique', status: 'active' },
      { name: 'Administration', code: 'ADMIN', description: 'Services administratifs et direction', status: 'active' },
    ];
    const buildings = await Building.create(buildingsData);
    const blocA = buildings.find(b => b.code === 'BLOCA');
    const blocB = buildings.find(b => b.code === 'BLOCB');
    const biblio = buildings.find(b => b.code === 'BIBLIO');
    const labInfo = buildings.find(b => b.code === 'LABINFO');
    const adminBuilding = buildings.find(b => b.code === 'ADMIN');
    console.log(`🏢 ${buildings.length} bâtiments créés`);

    // ── DOORS ─────────────────────────────────────────────────────
    const doorsData = [
      { name: 'Entrée Principale Bloc A', code: 'BLOCA-MAIN', buildingId: blocA._id, location: 'Rez-de-chaussée', status: 'active', securityLevel: 'low' },
      { name: 'Salle 101 Bloc A', code: 'BLOCA-101', buildingId: blocA._id, location: '1er étage', status: 'active', securityLevel: 'low' },
      { name: 'Entrée Principale Bloc B', code: 'BLOCB-MAIN', buildingId: blocB._id, location: 'Rez-de-chaussée', status: 'active', securityLevel: 'low' },
      { name: 'Bibliothèque Porte 1', code: 'BIBLIO-P1', buildingId: biblio._id, location: 'Entrée principale', status: 'active', securityLevel: 'low' },
      { name: 'Laboratoire 1', code: 'LABINFO-L1', buildingId: labInfo._id, location: 'Salle principale', status: 'active', securityLevel: 'medium' },
      { name: 'Salle Serveur', code: 'LABINFO-SRV', buildingId: labInfo._id, location: 'Sous-sol', status: 'active', securityLevel: 'high' },
      { name: 'Administration Porte RH', code: 'ADMIN-RH', buildingId: adminBuilding._id, location: 'Bureau RH', status: 'active', securityLevel: 'high' },
      { name: 'Direction', code: 'ADMIN-DIR', buildingId: adminBuilding._id, location: 'Bureau direction', status: 'inactive', securityLevel: 'high' },
    ];
    const doors = await Door.create(doorsData);
    console.log(`🚪 ${doors.length} portes créées`);

    const mainDoorA = doors.find(d => d.code === 'BLOCA-MAIN');
    const mainDoorB = doors.find(d => d.code === 'BLOCB-MAIN');
    const biblioDoor = doors.find(d => d.code === 'BIBLIO-P1');
    const labDoor = doors.find(d => d.code === 'LABINFO-L1');
    const serverRoom = doors.find(d => d.code === 'LABINFO-SRV');
    const adminRH = doors.find(d => d.code === 'ADMIN-RH');

    // ── BADGES ────────────────────────────────────────────────────
    const oneYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    const expired = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const badgesData = users.map((u, i) => ({
      badgeId: generateBadgeId('BADGE', i + 1),
      userId: u._id,
      status: u.status === 'suspended' ? 'blocked' : (i === 7 ? 'expired' : 'active'),
      issuedAt: new Date(),
      expiresAt: i === 7 ? expired : oneYear
    }));

    const badges = await Badge.create(badgesData);
    console.log(`🪪 ${badges.length} badges créés`);

    const studentBadge = badges.find(b => b.userId.toString() === studentUser._id.toString());
    const teacherBadge = badges.find(b => b.userId.toString() === teacherUser._id.toString());

    // ── PERMISSIONS ───────────────────────────────────────────────
    const permissionsData = [
      // Students can access main doors and library on weekdays
      { role: 'student', doorId: mainDoorA._id, buildingId: blocA._id, status: 'active', allowedDays: [1,2,3,4,5], startTime: '07:00', endTime: '20:00' },
      { role: 'student', doorId: mainDoorB._id, buildingId: blocB._id, status: 'active', allowedDays: [1,2,3,4,5], startTime: '07:00', endTime: '20:00' },
      { role: 'student', doorId: biblioDoor._id, buildingId: biblio._id, status: 'active', allowedDays: [1,2,3,4,5,6], startTime: '08:00', endTime: '18:00' },
      // Teachers can access all teaching areas
      { role: 'teacher', doorId: mainDoorA._id, buildingId: blocA._id, status: 'active' },
      { role: 'teacher', doorId: mainDoorB._id, buildingId: blocB._id, status: 'active' },
      { role: 'teacher', doorId: biblioDoor._id, buildingId: biblio._id, status: 'active' },
      { role: 'teacher', doorId: labDoor._id, buildingId: labInfo._id, status: 'active' },
      // Security access to all normal areas
      { role: 'security', doorId: mainDoorA._id, buildingId: blocA._id, status: 'active' },
      { role: 'security', doorId: mainDoorB._id, buildingId: blocB._id, status: 'active' },
      // Specific user permission: teacher can access server room
      { userId: teacherUser._id, doorId: serverRoom._id, buildingId: labInfo._id, status: 'active' },
      // Student demo gets lab access
      { userId: studentUser._id, doorId: labDoor._id, buildingId: labInfo._id, status: 'active' },
    ];
    await Permission.create(permissionsData);
    console.log(`🔐 ${permissionsData.length} permissions créées`);

    // ── ACCESS LOGS ───────────────────────────────────────────────
    const logsData = [];
    const now = Date.now();
    const logScenarios = [
      { userId: studentUser._id, badgeId: studentBadge.badgeId, buildingId: blocA._id, doorId: mainDoorA._id, result: 'granted', reason: 'Accès autorisé' },
      { userId: studentUser._id, badgeId: studentBadge.badgeId, buildingId: biblio._id, doorId: biblioDoor._id, result: 'granted', reason: 'Accès autorisé' },
      { userId: studentUser._id, badgeId: studentBadge.badgeId, buildingId: adminBuilding._id, doorId: adminRH._id, result: 'denied', reason: 'Aucune permission pour cette porte' },
      { userId: teacherUser._id, badgeId: teacherBadge.badgeId, buildingId: labInfo._id, doorId: labDoor._id, result: 'granted', reason: 'Accès autorisé' },
      { userId: teacherUser._id, badgeId: teacherBadge.badgeId, buildingId: labInfo._id, doorId: serverRoom._id, result: 'granted', reason: 'Accès autorisé' },
      { userId: studentUser._id, badgeId: studentBadge.badgeId, buildingId: labInfo._id, doorId: serverRoom._id, result: 'denied', reason: 'Aucune permission pour cette porte' },
    ];

    for (let i = 0; i < 30; i++) {
      const scenario = logScenarios[i % logScenarios.length];
      logsData.push({
        ...scenario,
        simulatedBy: adminUser._id,
        ipAddress: '127.0.0.1',
        createdAt: new Date(now - i * 45 * 60 * 1000) // every 45 min
      });
    }
    await AccessLog.insertMany(logsData);
    console.log(`📋 ${logsData.length} logs d'accès créés`);

    // ── INCIDENTS ─────────────────────────────────────────────────
    const incidentsData = [
      {
        title: 'Tentative d\'accès répétée - Badge bloqué',
        description: 'Un badge bloqué (BADGE-001) a tenté d\'accéder à la salle serveur 5 fois en 10 minutes. Suspicion d\'intrusion.',
        severity: 'critical',
        status: 'investigating',
        createdBy: securityUser._id,
        createdAt: new Date(now - 2 * 60 * 60 * 1000)
      },
      {
        title: 'Accès non autorisé à l\'Administration',
        description: 'Plusieurs étudiants ont tenté d\'accéder aux bureaux RH sans autorisation.',
        severity: 'medium',
        status: 'open',
        createdBy: securityUser._id,
        createdAt: new Date(now - 24 * 60 * 60 * 1000)
      },
      {
        title: 'Porte Bibliothèque - Dysfonctionnement détecté',
        description: 'La porte de la bibliothèque a été forcée. Intervention technique requise.',
        severity: 'high',
        status: 'resolved',
        createdBy: securityUser._id,
        createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000)
      }
    ];
    await Incident.insertMany(incidentsData);
    console.log(`🚨 ${incidentsData.length} incidents créés`);

    console.log('\n✅ Base de données initialisée avec succès!\n');
    console.log('📧 Comptes de démonstration:');
    console.log('   Admin:    ahmed.bensalah@universite.tn    / Admin123!');
    console.log('   Securite: yasmine.trabelsi@universite.tn  / Security123!');
    console.log('   Etudiant: marwen.gharbi@universite.tn     / Student123!');
    console.log('   Prof:     amira.jebali@universite.tn      / Teacher123!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seed();
