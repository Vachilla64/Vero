const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const authenticateJWT = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/user/profile
router.get('/profile', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;

    const userObj = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userObj) {
      return res.status(404).json({ error: 'User not found' });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const count = await prisma.verification.count({
      where: {
        userId,
        createdAt: {
          gte: startOfDay
        }
      }
    });

    res.status(200).json({
      id: userObj.id,
      email: userObj.email,
      name: userObj.name,
      isPremium: userObj.isPremium,
      lookupsToday: count,
      lookupsRemaining: userObj.isPremium ? null : Math.max(0, 15 - count)
    });
  } catch (error) {
    console.error('Profile Fetch Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/user/upgrade
router.post('/upgrade', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isPremium: true }
    });

    res.status(200).json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      isPremium: updatedUser.isPremium
    });
  } catch (error) {
    console.error('Upgrade Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/user/settings
router.post('/settings', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, password } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    res.status(200).json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      isPremium: updatedUser.isPremium
    });
  } catch (error) {
    console.error('Settings Update Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
