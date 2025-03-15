export const calculateTotalAmount = (expenses) => {
  return expenses.reduce((total, person) => {
    return (
      total + person.personalExpenses.reduce((sum, exp) => sum + exp.amount, 0)
    );
  }, 0);
};

export const findUserCaseInsensitive = (expenses, username) => {
  return expenses.find(
    (exp) => exp.name.toLowerCase() === username.toLowerCase()
  );
};

export const getExistingUserNames = (expenses) => {
  return new Set(expenses.map((exp) => exp.name.toLowerCase()));
};
