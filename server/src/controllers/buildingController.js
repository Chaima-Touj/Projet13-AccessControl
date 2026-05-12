const Building = require('../models/Building');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const getBuildings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const buildings = await Building.find(filter).sort({ name: 1 });
    return sendSuccess(res, { buildings });
  } catch (error) {
    next(error);
  }
};

const createBuilding = async (req, res, next) => {
  try {
    const building = await Building.create(req.body);
    return sendSuccess(res, { building }, 'Bâtiment créé', 201);
  } catch (error) {
    next(error);
  }
};

const updateBuilding = async (req, res, next) => {
  try {
    const building = await Building.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!building) return sendError(res, 'Bâtiment introuvable.', 404);
    return sendSuccess(res, { building }, 'Bâtiment mis à jour');
  } catch (error) {
    next(error);
  }
};

const deleteBuilding = async (req, res, next) => {
  try {
    const building = await Building.findByIdAndDelete(req.params.id);
    if (!building) return sendError(res, 'Bâtiment introuvable.', 404);
    return sendSuccess(res, {}, 'Bâtiment supprimé');
  } catch (error) {
    next(error);
  }
};

module.exports = { getBuildings, createBuilding, updateBuilding, deleteBuilding };
