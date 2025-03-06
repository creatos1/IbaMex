
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const busSchema = new Schema({
  busId: {
    type: String,
    required: true,
    unique: true
  },
  routeId: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    default: 40
  },
  currentOccupancy: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  batteryLevel: {
    type: Number,
    default: 100
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Bus', busSchema);
