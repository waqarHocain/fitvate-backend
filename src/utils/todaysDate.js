function todayDate() {
  /* Returns today's date in a string format */
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth();
  const year = today.getFullYear();
  return `${day}-${month}-${year}`;
}

module.exports = { todayDate };
