const express = require("express");
const session = require("express-session");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./Db/Db.js");
const authRoutes = require("./routes/auth");
const passport = require("./config/passport");
dotenv.config();

//queries import below
const { userDetailsQuery } = require("./queries/user");
const { loansQuery, loanDetailsQuery } = require("./queries/loan");
const { paymentDataQuery, recentPaymentsQuery } = require("./queries/payment");
const { comingUpQuery } = require("./queries/schedule");

const app = express();

const PORT = process.env.PORT;

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use("/", authRoutes);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Route to fetch "My Loans" for a specific user
app.get("/my-loans", async (req, res) => {
  try {
    const [
      userDetails,
      loans,
      comingUp,
      loanDetails,
      paymentData,
      recentPayments,
    ] = await Promise.all([
      db.query(userDetailsQuery, [1]), // Replace 1 with user ID
      db.query(loansQuery, [1]), // Replace 1 with user ID
      db.query(comingUpQuery, ["fa0001", "05/01/2025"]),
      db.query(loanDetailsQuery, ["fa0001"]),
      db.query(paymentDataQuery, ["fa0001"]),
      db.query(recentPaymentsQuery, ["05/01/2025"]),
    ]);

    // log
    // console.log("User Details:", userDetails);
    // console.log("Loans:", loans);
    // console.log("Coming Up:", comingUp);
    // console.log("Loan Details:", loanDetails);
    // console.log("Payment Data:", paymentData);
    // console.log("Recent Payments:", recentPayments);

    // Restructure data
    // Restructure data
    const response = {
      basic_details: {
        id: userDetails[0][0].id, // Access the first object inside the first array
        first_name: userDetails[0][0].first_name,
        middle_name: userDetails[0][0].middle_name || "",
        last_name: userDetails[0][0].last_name,
      },
      loan_as_lender: loans[0]
        .filter((loan) => loan.role === "Lender")
        .map((loan) => ({
          LoanNumber: loan.loan_no,
          creationdate: loan.creation_date,
          status: loan.status,
          amount: loan.amount,
          interest: loan.interest,
          score: loan.score || "0",
        })),
      loan_as_borrower: loans[0]
        .filter((loan) => loan.role === "Borrower")
        .map((loan) => ({
          LoanNumber: loan.loan_no,
          creationdate: loan.creation_date,
          status: loan.status,
          amount: loan.amount,
          interest: loan.interest,
          score: loan.score || "0",
        })),
      Coming_up: {
        balance: comingUp[0][0]?.balance || 0,
        dueDate: comingUp[0][0]?.due_date || null,
        amountdue: comingUp[0][0]?.amount_due || 0,
      },
      loan_details: {
        loan_amount: loanDetails[0][0]?.loan_amount || 0,
        interest_rate: loanDetails[0][0]?.interest_rate || 0,
        contract_date: loanDetails[0][0]?.contract_date || null,
        end_date: loanDetails[0][0]?.end_date || null,
      },
      payment_breakdown: {
        on_time_payments: paymentData[0][0]?.on_time_payments || 0,
        pre_payments: 0, // Placeholder, since not included in query
        late_payments: paymentData[0][0]?.past_due_payments || 0,
      },
      recent_payments: recentPayments[0].map((payment) => ({
        ScheduledDate: payment.ScheduledDate,
        scheduledPaidAmount: payment.scheduledPaidAmount,
        ActualDate: payment.ActualDate,
        PaidAmount: payment.PaidAmount,
        Status: payment.Status || "Pending",
      })),
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching loan data:", error.message);
    res.status(500).send({ error: "Failed to fetch loan data" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
