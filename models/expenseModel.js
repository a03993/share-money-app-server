import mongoose from "mongoose";
import { SettlementSchema } from "./settlementModel.js";
import {
  validatePositiveInteger,
  validateNonEmptyArray,
  validateUniqueSharedBy,
  validateHexColor,
} from "../middlewares/validations.js";

const personalExpenseSchema = new mongoose.Schema(
  {
    item: {
      type: String,
      required: true,
      trim: true,
      minLength: [1, "Item name cannot be empty"],
      maxLength: [50, "Item name is too long"],
    },
    amount: {
      type: Number,
      required: true,
      min: [1, "Amount must be greater than 0"],
      max: [999999999, "Amount is too large"],
      validate: {
        validator: validatePositiveInteger,
        message: "Amount must be a valid positive integer",
      },
    },
    sharedBy: {
      type: [String],
      required: true,
      validate: [
        {
          validator: function (v) {
            return validateNonEmptyArray(this.sharedBy);
          },
          message: "At least one user must share the expense",
        },
        {
          validator: validateUniqueSharedBy,
          message: "Duplicate users are not allowed in sharedBy",
        },
      ],
    },
  },
  { timestamps: true }
);

const userExpenseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: [1, "User name cannot be empty"],
      maxLength: [20, "User name is too long"],
    },
    color: {
      type: String,
      required: true,
      validate: {
        validator: validateHexColor,
        message: "Color must be a valid hex color code",
      },
    },
    personalExpenses: {
      type: [personalExpenseSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const expenseSchema = new mongoose.Schema(
  {
    linkId: { type: String, required: true, unique: true },
    expenses: {
      type: [userExpenseSchema],
      default: [],
    },
    settlements: {
      type: [SettlementSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Expense", expenseSchema);
