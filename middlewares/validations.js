export const validateLinkId = (req, res, next) => {
  const linkId = req.params.linkId || req.body.linkId;
  if (!linkId) {
    return res.status(400).json({ message: "LinkId is required" });
  }
  next();
};

export const validatePositiveInteger = (value) => {
  return Number.isInteger(value) && value > 0;
};

export const validateNonEmptyArray = (array) => {
  return Array.isArray(array) && array.length > 0;
};

export const validateUniqueSharedBy = (sharedBy) => {
  return new Set(sharedBy).size === sharedBy.length;
};

export const validateHexColor = (value) => {
  const hexColorRegex = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i;
  return hexColorRegex.test(value);
};

export const validateStatus = (status) => {
  const validStatuses = ["pending", "completed"];
  return validStatuses.includes(status);
};
