import express from "express";
import Expense from "../models/expenseModel.js";
import {
  calculateTotalAmount,
  findUserCaseInsensitive,
  getExistingUserNames,
} from "../utils/expenseUtils.js";
import { validateLinkId } from "../middlewares/validations.js";

const router = express.Router();

router.post("/", validateLinkId, async (req, res, next) => {
  try {
    const { linkId } = req.body;
    const existingExpense = await Expense.findOne({ linkId });

    if (existingExpense) {
      return res.status(400).json({ message: "LinkId already exists" });
    }

    const newExpense = new Expense({
      linkId,
      expenses: [],
    });

    const savedExpense = await newExpense.save();
    return res.status(201).json(savedExpense);
  } catch (error) {
    next(error);
  }
});

router.post("/:linkId/users", validateLinkId, async (req, res, next) => {
  try {
    const { users } = req.body;
    const { linkId } = req.params;

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        message: "Users must be a non-empty array",
      });
    }

    if (!users.every((user) => user.name && typeof user.name === "string")) {
      return res.status(400).json({
        message: "Each user must have a valid name property",
      });
    }

    const foundExpense = await Expense.findOne({ linkId });
    if (!foundExpense) {
      return res.status(404).json({ message: "Expense Page not found" });
    }

    const existingUsers = getExistingUserNames(foundExpense.expenses);
    const duplicateUsers = users.filter((user) =>
      existingUsers.has(user.name.toLowerCase())
    );

    if (duplicateUsers.length > 0) {
      return res.status(400).json({
        message: "Some users already exist",
        duplicateUsers: duplicateUsers.map((u) => u.name),
      });
    }

    foundExpense.expenses.push(...users);
    const updatedExpense = await foundExpense.save();
    return res.status(200).json(updatedExpense);
  } catch (error) {
    next(error);
  }
});

router.get("/:linkId", validateLinkId, async (req, res, next) => {
  try {
    const { linkId } = req.params;
    const foundExpense = await Expense.findOne({ linkId });

    if (!foundExpense) {
      return res.status(404).json({ message: "Expenses Page not found" });
    }

    const totalAmount = calculateTotalAmount(foundExpense.expenses);

    return res.status(200).json({
      linkId: foundExpense.linkId,
      expenses: foundExpense.expenses,
      settlements: foundExpense.settlements,
      totalAmount,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/:linkId", validateLinkId, async (req, res, next) => {
  try {
    const { linkId } = req.params;
    const { item, amount, payer, sharedBy } = req.body;

    if (!item || !amount || !payer || !sharedBy) {
      return res.status(400).json({
        message:
          "Missing required fields: item, amount, payer, and sharedBy are required",
      });
    }

    if (!Array.isArray(sharedBy) || sharedBy.length === 0) {
      return res.status(400).json({
        message: "sharedBy must be a non-empty array",
      });
    }

    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({
        message: "Amount must be a positive number",
      });
    }

    const foundExpense = await Expense.findOne({ linkId });
    if (!foundExpense) {
      return res.status(404).json({ message: "Expense Page not found" });
    }

    const payerExpense = findUserCaseInsensitive(foundExpense.expenses, payer);
    if (!payerExpense) {
      return res.status(404).json({ message: "Payer not found" });
    }

    const existingUsers = getExistingUserNames(foundExpense.expenses);
    const invalidUsers = sharedBy.filter(
      (user) => !existingUsers.has(user.toLowerCase())
    );

    if (invalidUsers.length > 0) {
      return res.status(400).json({
        message: "Some users in sharedBy do not exist",
        invalidUsers,
      });
    }

    payerExpense.personalExpenses.push({ item, amount, sharedBy });
    const updatedExpense = await foundExpense.save();

    const totalAmount = calculateTotalAmount(foundExpense.expenses);

    return res.status(201).json({ updatedExpense, totalAmount });
  } catch (error) {
    next(error);
  }
});

router.delete("/:linkId", validateLinkId, async (req, res, next) => {
  try {
    const { linkId } = req.params;
    const { _id } = req.body;

    if (!_id) {
      return res.status(400).json({ message: "Expense ID is required" });
    }

    const foundExpense = await Expense.findOne({ linkId });
    if (!foundExpense) {
      return res.status(404).json({ message: "Expense Page not found" });
    }

    let itemFound = false;
    foundExpense.expenses.forEach((person) => {
      const originalLength = person.personalExpenses.length;
      person.personalExpenses = person.personalExpenses.filter(
        (exp) => exp._id.toString() !== _id
      );
      if (person.personalExpenses.length < originalLength) {
        itemFound = true;
      }
    });

    if (!itemFound) {
      return res.status(404).json({ message: "Expense item not found" });
    }

    const updatedExpense = await foundExpense.save();

    const totalAmount = calculateTotalAmount(foundExpense.expenses);

    return res.status(200).json({ updatedExpense, totalAmount });
  } catch (error) {
    next(error);
  }
});

export default router;
