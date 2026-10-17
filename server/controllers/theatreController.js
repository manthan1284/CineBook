const Theatre = require('../models/Theatre');
const Screen = require('../models/Screen');

// @desc    Get all theatres (optionally filter by city)
// @route   GET /api/theatres
// @access  Public
const getTheatres = async (req, res, next) => {
  try {
    const { city, search } = req.query;
    let query = { isActive: true };

    if (city && city !== 'All') {
      query.city = { $regex: new RegExp(`^${city}$`, 'i') };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    const theatres = await Theatre.find(query).sort({ name: 1 });

    // Attach screen count for each theatre
    const theatresWithScreens = await Promise.all(
      theatres.map(async (th) => {
        const screensCount = await Screen.countDocuments({ theatreId: th._id, isActive: true });
        return {
          ...th.toObject(),
          screensCount,
        };
      })
    );

    res.json({
      success: true,
      count: theatresWithScreens.length,
      theatres: theatresWithScreens,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single theatre by ID with its screens
// @route   GET /api/theatres/:id
// @access  Public
const getTheatreById = async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found',
      });
    }

    const screens = await Screen.find({ theatreId: theatre._id, isActive: true });

    res.json({
      success: true,
      theatre,
      screens,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new theatre
// @route   POST /api/theatres
// @access  Private/Admin
const createTheatre = async (req, res, next) => {
  try {
    const { name, city, address, amenities, locationMapUrl } = req.body;

    const theatre = await Theatre.create({
      name,
      city,
      address,
      amenities: Array.isArray(amenities) ? amenities : (amenities || '').split(',').map((a) => a.trim()).filter(Boolean),
      locationMapUrl,
    });

    res.status(201).json({
      success: true,
      message: 'Theatre added successfully.',
      theatre,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update theatre
// @route   PUT /api/theatres/:id
// @access  Private/Admin
const updateTheatre = async (req, res, next) => {
  try {
    const { name, city, address, amenities, locationMapUrl, isActive } = req.body;

    const theatre = await Theatre.findByIdAndUpdate(
      req.params.id,
      {
        name,
        city,
        address,
        amenities: Array.isArray(amenities) ? amenities : (amenities || '').split(',').map((a) => a.trim()).filter(Boolean),
        locationMapUrl,
        isActive,
      },
      { new: true, runValidators: true }
    );

    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found',
      });
    }

    res.json({
      success: true,
      message: 'Theatre updated successfully.',
      theatre,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete theatre
// @route   DELETE /api/theatres/:id
// @access  Private/Admin
const deleteTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findByIdAndDelete(req.params.id);
    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found',
      });
    }
    // Also deactivate or remove associated screens
    await Screen.deleteMany({ theatreId: req.params.id });

    res.json({
      success: true,
      message: 'Theatre and associated screens deleted.',
    });
  } catch (error) {
    next(error);
  }
};

// Screen operations
const getScreens = async (req, res, next) => {
  try {
    const { theatreId } = req.params;
    const screens = await Screen.find({ theatreId, isActive: true });
    res.json({
      success: true,
      screens,
    });
  } catch (error) {
    next(error);
  }
};

const createScreen = async (req, res, next) => {
  try {
    const { theatreId, name, screenType, totalSeats, layoutConfig } = req.body;

    const screen = await Screen.create({
      theatreId,
      name,
      screenType: screenType || 'Standard',
      totalSeats: totalSeats || 160,
      layoutConfig: layoutConfig || {
        rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
        cols: 16,
        aisleIndices: [4, 12],
        tiers: [
          { name: 'Platinum', rows: ['A', 'B'], basePrice: 450 },
          { name: 'Gold', rows: ['C', 'D', 'E', 'F'], basePrice: 280 },
          { name: 'Silver', rows: ['G', 'H', 'I', 'J'], basePrice: 180 },
        ],
      },
    });

    res.status(201).json({
      success: true,
      message: 'Screen created successfully.',
      screen,
    });
  } catch (error) {
    next(error);
  }
};

const updateScreen = async (req, res, next) => {
  try {
    const screen = await Screen.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!screen) {
      return res.status(404).json({
        success: false,
        message: 'Screen not found',
      });
    }

    res.json({
      success: true,
      message: 'Screen layout updated successfully.',
      screen,
    });
  } catch (error) {
    next(error);
  }
};

const deleteScreen = async (req, res, next) => {
  try {
    const screen = await Screen.findByIdAndDelete(req.params.id);
    if (!screen) {
      return res.status(404).json({
        success: false,
        message: 'Screen not found',
      });
    }
    res.json({
      success: true,
      message: 'Screen removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTheatres,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre,
  getScreens,
  createScreen,
  updateScreen,
  deleteScreen,
};
