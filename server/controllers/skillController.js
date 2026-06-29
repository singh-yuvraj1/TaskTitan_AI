import SkillNode from '../models/SkillNode.js';
import Notification from '../models/Notification.js';

// @desc    Unlock a skill node if user meets total XP requirements
// @route   POST /api/skills/unlock
// @access  Private
export const unlockSkill = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();
    const { skillId } = req.body;

    const node = await SkillNode.findOne({ id: skillId, userEmail });
    if (!node) {
      return res.status(404).json({
        success: false,
        message: 'Skill node not found.',
        data: null,
        errors: [{ message: 'Skill ID does not exist.' }]
      });
    }

    if (req.user.xp < node.xpCost) {
      return res.status(400).json({
        success: false,
        message: `Insufficient XP. Unlocking "${node.name}" requires reaching a total of ${node.xpCost} XP. You currently have ${req.user.xp} XP.`,
        data: null,
        errors: [{ message: 'XP gate not satisfied.' }]
      });
    }

    node.unlocked = true;
    await node.save();

    // Deduct XP cost from user profile
    req.user.xp = Math.max(0, req.user.xp - node.xpCost);
    const newLevel = Math.floor(req.user.xp / 300) + 1;
    req.user.level = newLevel;

    let rank = 'Beginner';
    if (newLevel >= 50) rank = 'Grandmaster';
    else if (newLevel >= 20) rank = 'Master';
    else if (newLevel >= 10) rank = 'Ninja';
    else if (newLevel >= 5) rank = 'Explorer';
    req.user.rank = rank;

    await req.user.save();

    // Trigger Notification
    await Notification.create({
      id: `notif-skill-${Date.now()}`,
      userEmail,
      title: 'Skill Unlocked! 🛠️',
      message: `Unlocked skill node: ${node.name}. Benefit: ${node.bonusDesc}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'gamification',
      read: false,
      contextAware: false
    });

    res.status(200).json({
      success: true,
      message: 'Skill node unlocked successfully.',
      data: node,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};
