export const validateLinkId = (req, res, next) => {
  const linkId = req.params.linkId || req.body.linkId;
  if (!linkId) {
    return res.status(400).json({ message: "LinkId is required" });
  }
  next();
};

export const validateStatus = (status) => {
  const validStatuses = ["pending", "completed"];
  return validStatuses.includes(status);
};
