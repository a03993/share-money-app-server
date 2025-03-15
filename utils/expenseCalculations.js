export const calculateTotalAmount = (expenses) => {
  return expenses.reduce((total, person) => {
    return (
      total + person.personalExpenses.reduce((sum, exp) => sum + exp.amount, 0)
    );
  }, 0);
};
