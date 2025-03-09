import mongoose from "mongoose";

const UserInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minLength: [1, "User name cannot be empty"],
    maxLength: [20, "User name is too long"],
  },
  avatarColor: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^#[0-9A-Fa-f]{6}$/.test(v);
      },
      message: "Invalid color format",
    },
  },
});

const SettlementDetailSchema = new mongoose.Schema(
  {
    payer: {
      type: UserInfoSchema,
      required: true,
    },
    payee: {
      type: UserInfoSchema,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, "Amount must be greater than 0"],
      validate: {
        validator: function (value) {
          return !isNaN(value) && isFinite(value) && Number.isInteger(value);
        },
        message: "Amount must be a valid integer",
      },
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const SettlementSchema = new mongoose.Schema(
  {
    linkId: { type: String, required: true, ref: "Expense" },
    settlements: [SettlementDetailSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Settlement", SettlementSchema);
