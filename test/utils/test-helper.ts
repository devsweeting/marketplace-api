export const fillPayloadWithDefaults = (payload = {}, defaults = {}) => {
  const newPayload = {};
  Object.keys(defaults).forEach((key) => {
    if (payload[key]) {
      newPayload[key] = payload[key];
    } else if (defaults[key] !== undefined) {
      newPayload[key] = defaults[key];
    }
  });

  return newPayload;
};
