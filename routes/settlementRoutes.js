import express from "express";
import Settlement from "../models/settlementModel.js";
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
    const foundSettlement = await Settlement.findOne({ linkId });

    if (!foundSettlement) {
      const newSettlement = new Settlement({
        linkId,
        settlements: [],
      });

      await newSettlement.save();
      return res.status(201).json({
        message: "New settlement created",
        settlements: [],
      });
    }

    return res.status(200).json({
      linkId: foundSettlement.linkId,
      settlements: foundSettlement.settlements,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/:linkId", validateLinkId, async (req, res) => {
  try {
    const { linkId } = req.params;
    const { currentExpenseItem } = req.body;

    if (!currentExpenseItem) {
      return res.status(400).json({
        message: "Invalid data. Please provide currentExpenseItem",
      });
    }

    const actualExpense = calculateTotalExpensePerPerson(currentExpenseItem);
    const paidAmount = calculateAmountPaidByEachPerson(currentExpenseItem);
    const settlements = calculatePayments(
      actualExpense,
      paidAmount,
      currentExpenseItem
    );

    const settlementsWithStatus = settlements.map((settlement) => ({
      ...settlement,
      status: "pending",
    }));

    const updatedSettlement = await Settlement.findOneAndUpdate(
      { linkId },
      { settlements: settlementsWithStatus },
      { new: true, upsert: true }
    );

    return res.status(201).json({
      settlements: updatedSettlement.settlements,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put("/:linkId/:settlementId", validateLinkId, async (req, res) => {
  try {
    const { linkId, settlementId } = req.params;

    const foundSettlement = await Settlement.findOne({ linkId });
    if (!foundSettlement) {
      return res.status(404).json({ message: "Settlement not found" });
    }

    const settlementDetail = foundSettlement.settlements.id(settlementId);
    if (!settlementDetail) {
      return res.status(404).json({ message: "Settlement detail not found" });
    }

    settlementDetail.status =
      settlementDetail.status === "pending" ? "completed" : "pending";
    await foundSettlement.save();

    return res.status(200).json({
      settlements: foundSettlement.settlements,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
