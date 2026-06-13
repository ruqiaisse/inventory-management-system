const Settings = require("../models/Settings");
const { logActivity } = require("../utils/activityLogger");

// GET SETTINGS
const getSettings = async (req, res) => {
	try {
		let settings = await Settings.findOne({}).populate("updatedBy", "name");

		if (!settings) {
			// return defaults
			settings = new Settings();
		}

		res.json(settings);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// UPDATE SETTINGS (admin only)
const updateSettings = async (req, res) => {
	try {
		const data = {
			companyName: req.body.companyName,
			currency: req.body.currency,
			lowStockThreshold: req.body.lowStockThreshold,
			allowRegistration: req.body.allowRegistration,
			updatedBy: req.user ? req.user._id : undefined,
		};

		const settings = await Settings.findOneAndUpdate({}, data, { upsert: true, new: true });

		await logActivity("Settings updated", "users", req.user ? req.user._id : null);

		res.json(settings);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

module.exports = { getSettings, updateSettings };
