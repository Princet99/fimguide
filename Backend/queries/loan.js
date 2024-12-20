const loansQuery = `
  SELECT 
      l.loan_no,
      l.amount,
      l.rate AS interest,
      DATE_FORMAT(l.creation_date, '%m/%d/%Y') AS creation_date,
      l.status,
      l.score,
      lu.role
  FROM 
      loan l
  JOIN 
      loan_user lu ON l.loan_no = lu.loan_no
  WHERE 
      lu.user_id = ?; -- Replace with desired user ID
`;

const loanDetailsQuery = `
  SELECT 
      l.amount AS loan_amount,
      l.rate AS interest_rate,
      DATE_FORMAT(l.creation_date, '%m/%d/%Y') AS contract_date,
      DATE_FORMAT(MAX(s.schedule_date), '%m/%d/%Y') AS end_date
  FROM 
      loan l
  JOIN 
      schedule s ON l.loan_no = s.loan_no
  WHERE 
      l.loan_no = ?
  GROUP BY 
      l.amount, l.rate, l.creation_date;
`;

module.exports = { loansQuery, loanDetailsQuery };
