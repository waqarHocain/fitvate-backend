const uuid = require("uuid");

function generateReqId() {
  return uuid.v4();
}

module.exports = {
  generateReqId,
};
