const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },

    email: {
      type: String,
    },

    password: {
      type: String,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
    },

    resetPasswordToken: {
      type: String,
    },

    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('findOneAndDelete', async function (next) {
  const userId = this.getQuery()._id;
  await Item.deleteMany({ user: userId });
  next();
});

module.exports = mongoose.model('User', userSchema);
