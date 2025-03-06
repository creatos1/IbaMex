
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const routeSchema = new Schema({
  routeId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  stops: [{
    name: String,
    location: {
      lat: Number,
      lng: Number
    }
  }],
  active: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Route', routeSchema);
