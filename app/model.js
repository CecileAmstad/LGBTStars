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
var UserSchema = new Schema({
    username: {type: String, required: true},
    gender: {type: String, required: true},
    age: {type: Number, required: true},
    favlang: {type: String, required: true},
    location: {type: [Number], required: true}, // [Long, Lat]
    htmlverified: String,
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now},
	featureCollections : {type: [FeatureSchema], required:true}
	
});

// Sets the created_at parameter equal to the current time
UserSchema.pre('save', function(next){
    now = new Date();
    this.updated_at = now;
    if(!this.created_at) {
        this.created_at = now
    }
    next();
});

FeatureSchema.pre('save', function(next){
    now = new Date();
    this.updated_at = now;
    if(!this.created_at) {
        this.created_at = now
    }
    next();
});

// Indexes this schema in geoJSON format (critical for running proximity searches)
//UserSchema.index({location: '2dsphere'});
FeatureSchema.index({"geometry": '2dsphere'});

// Exports the UserSchema for use elsewhere. Sets the MongoDB collection to be used as: "scotch-user"
module.exports = mongoose.model('testing', UserSchema);
//module.exports = mongoose.model('shield', FeatureSchema);
//module.exports = mongoose.model('shieldTest', FeatureSchema);
