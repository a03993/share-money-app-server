import express from "express";
import Expense from "../models/expenseModel.js";
// import Settlement from "../models/settlementModel.js";
import {
  calculateTotalExpensePerPerson,
  calculateAmountPaidByEachPerson,
  calculatePayments,
} from "../utils/settlementUtils.js";
import { validateLinkId, validateStatus } from "../middlewares/validations.js";

const router = express.Router();

// Routes
router.get("/:linkId", validateLinkId, async (req, res) => {
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
    return res.status(500).json({ message: error.message });
  }
});

router.post("/:linkId", validateLinkId, async (req, res) => {
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

    const settlementsWithStatus = settlements.map((settlement) => ({
      ...settlement,
      status: "pending",
    }));

    const foundExpense = await Expense.findOneAndUpdate(
      { linkId },
      { $set: { settlements: settlementsWithStatus } },
      { new: true, upsert: true }
    );

    return res.status(201).json({
      settlements: foundExpense.settlements,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put("/:linkId/:settlementId", validateLinkId, async (req, res) => {
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
    return res.status(500).json({ message: error.message });
  }
});

export default router;
