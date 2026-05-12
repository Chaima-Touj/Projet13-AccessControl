const Incident = require('../models/Incident');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const getIncidents = async (req, res, next) => {
  try {
    const { status, severity } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;

    const incidents = await Incident.find(filter)
      .populate('createdBy', 'fullName role')
      .populate('relatedAccessLogId')
      .sort({ createdAt: -1 });

    return sendSuccess(res, { incidents });
  } catch (error) {
    next(error);
  }
};

const createIncident = async (req, res, next) => {
  try {
    const incident = await Incident.create({ ...req.body, createdBy: req.user._id });
    const populated = await incident.populate('createdBy', 'fullName role');
    return sendSuccess(res, { incident: populated }, 'Incident créé', 201);
  } catch (error) {
    next(error);
  }
};

const updateIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('createdBy', 'fullName role');
    if (!incident) return sendError(res, 'Incident introuvable.', 404);
    return sendSuccess(res, { incident }, 'Incident mis à jour');
  } catch (error) {
    next(error);
  }
};

const deleteIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);
    if (!incident) return sendError(res, 'Incident introuvable.', 404);
    return sendSuccess(res, {}, 'Incident supprimé');
  } catch (error) {
    next(error);
  }
};

module.exports = { getIncidents, createIncident, updateIncident, deleteIncident };
