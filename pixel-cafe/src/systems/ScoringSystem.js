import { orderFields } from '../data/menuItems.js';

export class ScoringSystem {
  scoreOrder(customerOrder, preparedOrder) {
    const correctFields = orderFields.filter((field) => {
      return customerOrder[field.key] === preparedOrder[field.key];
    });

    const correctCount = correctFields.length;
    const totalCount = orderFields.length;
    const accuracy = Math.round((correctCount / totalCount) * 100);
    const coins = Math.round((accuracy / 100) * 20);

    return {
      accuracy,
      coins,
      correctCount,
      totalCount,
    };
  }
}
