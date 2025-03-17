import express from "express";
import Expense from "../models/expenseModel.js";

import {
  calculateTotalExpensePerPerson,
  calculateAmountPaidByEachPerson,
  calculatePayments,
} from "../utils/settlementUtils.js";
import { validateLinkId } from "../middlewares/validations.js";

const router = express.Router();

router.get("/:linkId", validateLinkId, async (req, res, next) => {
  try {
    const { linkId } = req.params;
    const foundExpense = await Expense.findOne({ linkId });

    if (!foundExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    return res.status(200).json({
      settlements: foundExpense.settlements,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/:linkId", validateLinkId, async (req, res, next) => {
  try {
    const { linkId } = req.params;
    const { expenseList } = req.body;

    if (!expenseList) {
      return res.status(400).json({
        message: "Invalid data. Please provide currentExpenseItem",
      });
    }

    const actualExpense = calculateTotalExpensePerPerson(expenseList);
    const paidAmount = calculateAmountPaidByEachPerson(expenseList);
    const settlements = calculatePayments(
      actualExpense,
      paidAmount,
      expenseList
    );

    const foundExpense = await Expense.findOneAndUpdate(
      { linkId },
      { settlements: settlements },
      { new: true, upsert: true }
    );

    return res.status(201).json({
      settlements: foundExpense.settlements,
    });
  } catch (error) {
    next(error);
  }
});

router.put("/:linkId/:settlementId", validateLinkId, async (req, res, next) => {
  try {
    const { linkId, settlementId } = req.params;

    const foundExpense = await Expense.findOne({ linkId });
    if (!foundExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const settlementDetail = foundExpense.settlements.id(settlementId);
    if (!settlementDetail) {
      return res.status(404).json({ message: "Settlement detail not found" });
    }

    settlementDetail.status =
      settlementDetail.status === "pending" ? "completed" : "pending";
    await foundExpense.save();

    return res.status(200).json({
      settlements: foundExpense.settlements,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
