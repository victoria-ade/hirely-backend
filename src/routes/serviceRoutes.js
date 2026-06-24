const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');
const { providerOnly } = require('../middleware/providerMiddleware');

// Define getMyServices directly here temporarily
const getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user._id })
      .sort({ createdAt: -1 });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

router.get('/', getServices);
router.get('/my-services', protect, providerOnly, getMyServices);
router.get('/:id', getServiceById);
router.post('/', protect, providerOnly, createService);
router.put('/:id', protect, providerOnly, updateService);
router.delete('/:id', protect, providerOnly, deleteService);
module.exports = router;