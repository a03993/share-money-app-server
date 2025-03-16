import mongoose from "mongoose";
import { SettlementSchema } from "./settlementModel.js";

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
      min: [0, "Amount must be greater than 0"],
      max: [999999999, "Amount is too large"],
      validate: {
        validator: function (value) {
          return Number.isSafeInteger(value) && value >= 0;
        },
        message: "Amount must be a valid positive integer",
      },
    },
    sharedBy: [
      {
        type: String,
        required: true,
        validate: {
          validator: function (v) {
            return v.length > 0;
          },
          message: "At least one user must share the expense",
        },
      },
      {
        validator: function (v) {
          // check if there are duplicate users in sharedBy
          return new Set(this.sharedBy).size === this.sharedBy.length;
        },
        message: "Duplicate users are not allowed in sharedBy",
      },
    ],
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
        validator: function (v) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: "Color must be a valid hex color code",
      },
    },
    personalExpenses: [personalExpenseSchema],
  },
  { timestamps: true }
);

const expenseSchema = new mongoose.Schema(
  {
    linkId: { type: String, required: true, unique: true },
    expenses: [userExpenseSchema],
    settlements: [SettlementSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Expense", expenseSchema);
