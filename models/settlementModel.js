import mongoose from "mongoose";
import {
  validatePositiveInteger,
  validateHexColor,
} from "../middlewares/validations.js";

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
      validator: validateHexColor,
      message: "Invalid color format",
    },
  },
});

export const SettlementSchema = new mongoose.Schema(
  {
    payer: {
      type: UserInfoSchema,
      required: true,
      default: {},
    },
    payee: {
      type: UserInfoSchema,
      required: true,
      default: {},
    },
    amount: {
      type: Number,
      required: true,
      min: [1, "Amount must be greater than 0"],
      validate: {
        validator: validatePositiveInteger,
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
