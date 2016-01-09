// Pulls Mongoose dependency for creating schemas
var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

var FeatureSchema = new Schema({"type": {type: String, required: true,default: 'Feature'},
	 geometry: {
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now},
    type: {type: String},
    coordinates: {type: [Number], required: true}
  },
  properties: {type: Schema.Types.Mixed}})
;// Creates a User Schema. This will be the basis of how user data is stored in the db

// Exports the UserSchema for use elsewhere. Sets the MongoDB collection to be used as: "scotch-user"
module.exports = mongoose.model('testing', FeatureSchema);
//module.exports = mongoose.model('shield', FeatureSchema);
//module.exports = mongoose.model('shieldTest', FeatureSchema);
