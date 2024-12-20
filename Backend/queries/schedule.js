const comingUpQuery = `
  SELECT 
      p.balance,
      DATE_FORMAT(s.schedule_date, '%m/%d/%Y') AS due_date,
      s.amount AS amount_due
  FROM 
      schedule s
  JOIN 
      payment p ON s.id = p.schedule_id
  WHERE 
      s.loan_no = ? AND
      s.schedule_date = STR_TO_DATE(?, '%m/%d/%Y');
`;

module.exports = { comingUpQuery };
