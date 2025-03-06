
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const occupancyLogSchema = new Schema({
  busId: {
    type: String,
    required: true
  },
  routeId: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('OccupancyLog', occupancyLogSchema);
