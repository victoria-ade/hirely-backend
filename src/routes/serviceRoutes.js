const express = require('express');
const router = express.Router();
const {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const {protect} = require('../middleware/authMiddleware');
const {providerOnly} = ('../middleware/providerMiddleware');

router.get('/', getServices);
router.get('/:id', getServiceById);
router.post('/', protect, providerOnly, createService);
router.put('/:id', protect, providerOnly,updateService);
router.delete('/:id', protect, providerOnly, deleteService);

module.exports = router;