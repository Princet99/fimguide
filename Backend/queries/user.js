const userDetailsQuery = `
  SELECT 
      u.id AS id,
      u.first_name AS first_name,
      u.middle_name AS middle_name,
      u.last_name AS last_name
  FROM 
      user u
  WHERE 
      u.id = ?; -- Replace with desired user ID
`;

module.exports = { userDetailsQuery };
