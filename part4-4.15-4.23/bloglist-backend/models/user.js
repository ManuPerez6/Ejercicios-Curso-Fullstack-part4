const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: [3, 'Username must be at least 3 characters long'],
  },
  name: String,
  passwordHash: {
    type: String,
    required: true,
  },
  blogs: {
  type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }],
  default: []
  }
});

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash;
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
