const express = require('express');
const router = express.Router();
const {
  createService,
  getServices,
  getMyServices,
  getServiceById,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');
const { providerOnly } = require('../middleware/providerMiddleware');

router.get('/', getServices);
router.get('/my-services', protect, providerOnly, getMyServices);
router.get('/:id', getServiceById);
router.post('/', protect, providerOnly, createService);
router.put('/:id', protect, providerOnly, updateService);
router.delete('/:id', protect, providerOnly, deleteService);

module.exports = router;