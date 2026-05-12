const Door = require('../models/Door');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const getDoors = async (req, res, next) => {
  try {
    const { status, buildingId, securityLevel } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (buildingId) filter.buildingId = buildingId;
    if (securityLevel) filter.securityLevel = securityLevel;

    const doors = await Door.find(filter)
      .populate('buildingId', 'name code status')
      .sort({ name: 1 });
    return sendSuccess(res, { doors });
  } catch (error) {
    next(error);
  }
};

const createDoor = async (req, res, next) => {
  try {
    const door = await Door.create(req.body);
    const populated = await door.populate('buildingId', 'name code');
    return sendSuccess(res, { door: populated }, 'Porte créée', 201);
  } catch (error) {
    next(error);
  }
};

const updateDoor = async (req, res, next) => {
  try {
    const door = await Door.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('buildingId', 'name code status');
    if (!door) return sendError(res, 'Porte introuvable.', 404);
    return sendSuccess(res, { door }, 'Porte mise à jour');
  } catch (error) {
    next(error);
  }
};

const deleteDoor = async (req, res, next) => {
  try {
    const door = await Door.findByIdAndDelete(req.params.id);
    if (!door) return sendError(res, 'Porte introuvable.', 404);
    return sendSuccess(res, {}, 'Porte supprimée');
  } catch (error) {
    next(error);
  }
};

module.exports = { getDoors, createDoor, updateDoor, deleteDoor };
