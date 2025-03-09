import express from "express";
import Settlement from "../models/settlementModel.js";

const router = express.Router();

// Helper functions
const validateLinkId = (req, res, next) => {
  const linkId = req.params.linkId || req.body.linkId;
  if (!linkId) {
    return res.status(400).json({ message: "LinkId is required" });
  }
  next();
};

const validateStatus = (status) => {
  const validStatuses = ["pending", "completed", "rejected"];
  return validStatuses.includes(status);
};

// Routes
router.get("/:linkId", validateLinkId, async (req, res) => {
  try {
    const { linkId } = req.params;
    const settlement = await Settlement.findOne({ linkId });

    if (!settlement) {
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
      linkId: settlement.linkId,
      settlements: settlement.settlements,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/:linkId", validateLinkId, async (req, res) => {
  try {
    const { linkId } = req.params;
    const { settlements } = req.body;

    if (!settlements || !Array.isArray(settlements)) {
      return res.status(400).json({
        message: "Invalid settlements data. Settlements must be an array",
      });
    }

    const settlementsWithStatus = settlements.map((settlement) => ({
      ...settlement,
      status: "pending",
    }));

    const settlement = await Settlement.findOneAndUpdate(
      { linkId },
      { settlements: settlementsWithStatus },
      { new: true, upsert: true }
    );

    return res.status(201).json({
      linkId: settlement.linkId,
      settlements: settlement.settlements,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put("/:linkId/:settlementId", validateLinkId, async (req, res) => {
  try {
    const { linkId, settlementId } = req.params;
    const { status } = req.body;

    if (!status || !validateStatus(status)) {
      return res.status(400).json({
        message:
          "Invalid status. Status must be one of: pending, completed, rejected",
      });
    }

    const settlement = await Settlement.findOne({ linkId });
    if (!settlement) {
      return res.status(404).json({ message: "Settlement not found" });
    }

    const settlementDetail = settlement.settlements.id(settlementId);
    if (!settlementDetail) {
      return res.status(404).json({ message: "Settlement detail not found" });
    }

    settlementDetail.status = status;
    await settlement.save();

    return res.status(200).json({
      linkId: settlement.linkId,
      settlement: settlementDetail,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
