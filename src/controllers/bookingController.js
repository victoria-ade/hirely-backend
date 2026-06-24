const Booking = require('../models/Booking');
const Service = require('../models/Service');

// To create a booking with the route POST /api/bookings to be accessed by Private/Customer

const createBooking = async (req, res) => {
  try {
    const {serviceId, message, scheduledDate} = req.body;

    // To find the service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({message: 'Service not found'});
    }

    // To make sure service  is available 
    if (!service.isAvailable) {
      return res.status(400).json({message: 'Service is not available'});
    }

    // To prevent providers from booking their own service
    if (service.provider.toString() === req.user._id.toString()) {
      return res.status(400).json({message: 'You cannot book your service'});
    }

    const booking = await Booking.create({
      service: service._id,
      customer: req.user._id,
      provider: service.provider, 
      message, 
      scheduledDate,
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

// To get bookings for logged in customer with the route GET /api/bookings/my-bookings to be accessed by Private/Customer
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({customer: req.user._id})
    .populate('service', 'title category price location')
    .populate('provider', 'name email')
    .sort({createdAt: -1});

    res.status(200).json({bookings});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

// To get bookings for logged in provider with route GET /api/bookings/provider to be accessed by Private/Provider
const getProviderBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({provider: req.user._id})
    .populate('service', 'title category price location')
    .populate('customer', 'name email')
    .sort({createdAt: -1});

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

// To update booking status with route PATCH /api/bookings/:id to be accessed by Private/Provider
const updateBookingStatus = async (req, res) => {
  try {
    const {status} = req.body;

    // To validate status value
    const allowedStatuses = ['accepted', 'rejected', 'completed'];
    if (!allowedStatuses.includes(status)) 
      {
        return res.status(400).json({message: 'invalid status value'});
      }
    
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({message: 'Booking not found'});
    }

    // to make sure only the provider of this booking can update it
    if (booking.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({message: 'Not authorized to update this booking'});  
    }

    // To prevent updating a booking that is already closed
    if (booking.status === 'rejected' || booking.status === 'completed') {
      return res.status(400).json({message: `Booking is already ${booking.status}`});
    }

    booking.status = status;
    await booking.save();
    
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getProviderBookings,
  updateBookingStatus,
};