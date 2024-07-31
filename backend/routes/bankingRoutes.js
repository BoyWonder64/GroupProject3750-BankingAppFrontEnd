const express = require('express')
const recordRoutes = express.Router()
const dbo = require('../db/conn')
const transactions = []; //Storing all transactions inside the array

 
/////////////////////////////
//                         //
//      Assignment 4       //
//                         //
/////////////////////////////

// This section will help you create a new record. ******************************

//Add logic 
recordRoutes.route("/record/create").post(async (req, res) => {
    try{
 let db_connect = dbo.getDb();

 let accountNum = 1000
 let flag = false;

 let myobj = {
   username: req.body.username,
   password: req.body.password,
   role: req.body.role,
   checkings: 0,
   savings: 0,
   investments: 0,
   accountID: accountNum,
   transactionHistory: []
 };




 console.log("----Begin Body Grab----")
 console.log(req.body.username)
 console.log(req.body.password)
 console.log(req.body.role)
 console.log("----end of body grab----")


 let myquery = { username: req.body.username}; //search for username from body
 const account = await db_connect.collection("accounts").findOne(myquery); 


 if(account != null){
    return await res.status(400).json({ message: "Username already exists" })
 } 

 else{
  let accountIDQuery = {accountID: accountNum}

  while (!flag) {

    let accountIDQuery = { accountID: accountNum };
    const accountIdCheck = await db_connect.collection("accounts").findOne(accountIDQuery);

    if (accountIdCheck) {
        accountNum += 1;
        console.log(accountNum);
    } else {
        flag = true;
        myobj.accountID = accountNum;
        console.log("Added new accountID")
        break;
    }
}

    const result = await db_connect.collection("accounts").insertOne(myobj); //otherwise it inserts into db
    console.log(" ------- inside create -------------")
    console.log("username added to database")
    let myquery = { username: req.body.username, password: req.body.password}; 
    const account = await db_connect.collection("records").findOne( myquery ); 
    console.log("-------------End of Create------------------")
    res.send(account); //send account back to account Summary Page
  
 }
    } catch(err) {
        throw err;
    }
});

//This section will sorta perform a login message **************************************
recordRoutes.route("/record/login").post(async (req, res) => {
    try{
 let db_connect = dbo.getDb();
req.session.username = null
req.session.role = null
 let myquery = { username: req.body.username, password: req.body.password}; 
 const account = await db_connect.collection("accounts").findOne( myquery ); 
 if(account){ //if its not empty ie if it exists
   console.log("successfully logged in")
   console.log(account.username, " ", account.role)
   req.session.accountID = account.accountID //create an accountID session
   req.session.username = account.username
   req.session.role = account.role; //Create the session based on the role!
   console.log("session Role is set too: " + req.session.role)
   console.log("End of Login")
   res.send(account); //send account back to account Summary Page
 } else {
   console.log("unsuccessfully logged in")
   res.status(200).json({ message: "Not authenticated" });

 }
    } catch(err) {
      res.status(200).json({ message: "unsuccessfully logged in" })
        throw err;
    }
});

// Check authentication
recordRoutes.route("/record/auth-check").get((req, res) => {
  console.log("Entered the auth-check route")
  if (req.session && req.session.username) {
    console.log("Role is set too: " + req.session.role)
    console.log("Username is set too: " + req.session.username)
    res.json({ role: req.session.role });
    console.log("End of auth-check route")
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});



recordRoutes.route("/record/logout").post(async (req, res) => {
   try{
    console.log("logged out")
      req.session.destroy()
      res.send({message: "logged out"})
   } catch(err) {
     res.status(200).json({ message: "unsuccessfully logged out" })
       throw err;
   }
});

//This section will serve as the logic for the backend accountSummary **************************************
recordRoutes.route("/record/accountSummary").get(async (req, res) => {
   try{
    console.log("--- Inside account Summary ---")
      let db_connect = dbo.getDb();
    if(!req.session.username){
      return res.status(201).send({ message: 'Session Not Set!!' })
      }
  console.log("session for Username was found")
  const user = await db_connect.collection("accounts").findOne( {accountID: (req.session.accountID)}); 
  res.send(user);

   } catch(err) {
       throw err;
   }
});

// Handles deposits and withdrawals
recordRoutes.route("/record/transaction").post(async (req, res) => {
  const { accountID, transactionType, accountType, amount } = req.body; //We may need to figure out a better way to get the user information
  const timestamp = new Date().toISOString(); //Grabs the timestamp 

  try {
    const account = await db_connect.collection("accounts").findOne({ accountID });

    // Log the request details
    console.log("Received transaction request:");
    console.log("Selected accountID:", accountID);
    console.log("Transaction Type:", transactionType);
    console.log("Account Type:", accountType);
    console.log("Amount:", amount);

    if (!account) {
        return res.status(404).json({ message: "Account not found" });
    }

    let updatedValue;

    if (transactionType === 'deposit') {
        updatedValue = { $inc: { [accountType]: parseFloat(amount) } };
    } 
    else if (transactionType === 'withdraw') {
        // Checks if account has enough for withdrawal amount
        if (account[accountType] >= parseFloat(amount)) {
            updatedValue = { $inc: { [accountType]: -parseFloat(amount) } };
        } 
        else {
            console.log("Need mo' money");
            return res.status(400).json({ message: "Need mo' money" });
        }
    } 
    else {
        return res.status(400).json({ message: "Transaction Failed" });
    }

    await db_connect.collection("accounts").updateOne(
        { accountID },
        updatedValue
    );

    // Update transaciton array
    await db_connect.collection("accounts").updateOne(
        { accountID },
        { $push: { transactionHistory: { type: transactionType, account: accountType, amount, timestamp: new Date().toISOString() } } }
    );

    res.status(200).json({ message: "Transaction logged" });
} catch (err) {
    console.log("Transaction error");
    res.status(500).json({ message: "Transaction Error" });
}
});

// Handles transferring money between users
recordRoutes.route("/record/transfer").post(async (req, res) => {
  const { fromAccountID, fromAccountType, toAccountID, toAccountType, amount } = req.body;
  const db_connect = dbo.getDb();

  try {
      const fromAccount = await db_connect.collection("accounts").findOne({ accountID: fromAccountID });
      const toAccount = await db_connect.collection("accounts").findOne({ accountID: toAccountID });

      // Checks if both accounts exist
      if (!fromAccount || !toAccount) {
          console.log
          return res.status(404).json({ message: "Account not found" });
      }

      // Checks if enough money is in from account
      if (fromAccount[fromAccountType] < parseFloat(amount)) {
          console.log("Not enough in source account");
          return res.status(400).json({ message: "Not enough in source account" });
      }

      // Update account balances
      await db_connect.collection("accounts").updateOne(
          { accountID: fromAccountID },
          { $inc: { [fromAccountType]: -parseFloat(amount) } }
      );
      await db_connect.collection("accounts").updateOne(
          { accountID: toAccountID },
          { $inc: { [toAccountType]: parseFloat(amount) } }
      );

      // Update transaction arrays
      await db_connect.collection("accounts").updateOne(
          { accountID: fromAccountID },
          { $push: { transactionHistory: { type: 'transfer', fromAccountType, toAccountID, amount, timestamp: new Date().toISOString() } } }
      );
      await db_connect.collection("accounts").updateOne(
          { accountID: toAccountID },
          { $push: { transactionHistory: { type: 'transfer', fromAccountID, toAccountType, amount, timestamp: new Date().toISOString() } } }
      );

      res.status(200).json({ message: "Transfer successful" });
  } catch (err) {
      console.log("Transfer error");
      res.status(500).json({ message: "Transfer Error" });
  }
});


recordRoutes.route("/record/transactionHistory").get(async (req, res) => {
  try {
    let db_connect = dbo.getDb();
    const transactionHistory = await db_connect.collection("accounts").findOne( {username: (req.session.username)}); 
    res.json(transactionHistory);
  } catch (error) {
    console.error('Failed to fetch transaction history:', error);
    res.status(500).send('Internal Server Error');
  }
});

recordRoutes.route("/record/bankingSummary").post(async (req, res) => {
  const { transactionType, amount, account } = req.body;

  try {
    let db_connect = dbo.getDb();
    console.log("--- Inside of Banking Summary ---");

    if (!req.session.accountID) {
      return res.status(401).send({ message: 'Session Not Set!' });
    }
    console.log("Session ID is set: " + req.session.accountID);

    const databaseAccount = await db_connect.collection("accounts").findOne({ accountID: req.session.accountID });

    if (!databaseAccount) {
      console.log("Account was not found");
      return res.status(404).send({ message: 'User not found in database' });
    }

    let updateResult;

    if (transactionType === "deposit") {
      const increaseValue = Number(amount);

      if (account === "savings") {
        updateResult = await db_connect.collection("accounts").updateOne(
          { accountID: req.session.accountID },
          { $inc: { savings: increaseValue } }
        );
      } else if (account === "checkings") {
        updateResult = await db_connect.collection("accounts").updateOne(
          { accountID: req.session.accountID },
          { $inc: { checkings: increaseValue } }
        );
      } else if (account === "investments") {
        updateResult = await db_connect.collection("accounts").updateOne(
          { accountID: req.session.accountID },
          { $inc: { investments: increaseValue } }
        );
      }

    } else if (transactionType === "withdraw") {
      let decreaseValue = Number(amount);

      if (account === "savings") {
        if (databaseAccount.savings >= decreaseValue) {
          updateResult = await db_connect.collection("accounts").updateOne(
            { accountID: req.session.accountID },
            { $set: { savings: databaseAccount.savings - decreaseValue } }
          );
        } else {
          return res.status(400).send({ message: 'Insufficient funds in savings' });
        }
      } else if (account === "checkings") {
        if (databaseAccount.checkings >= decreaseValue) {
          updateResult = await db_connect.collection("accounts").updateOne(
            { accountID: req.session.accountID },
            { $set: { checkings: databaseAccount.checkings - decreaseValue } }
          );
        } else {
          return res.status(400).send({ message: 'Insufficient funds in checkings' });
        }
      } else if (account === "investments") {
        if (databaseAccount.investments >= decreaseValue) {
          updateResult = await db_connect.collection("accounts").updateOne(
            { accountID: req.session.accountID },
            { $set: { investments: databaseAccount.investments - decreaseValue } }
          );
        } else {
          return res.status(400).send({ message: 'Insufficient funds in investments' });
        }
      }
    } else {
      return res.status(400).send({ message: 'Invalid transaction type' });
    }

    // Log the transaction
    const logTransaction = await db_connect.collection("accounts").updateOne(
      { accountID: req.session.accountID },
      {
        $push: {
          transactionHistory: {
            type: transactionType,
            account: account,
            amount: amount,
            timestamp: new Date().toISOString()
          }
        }
      }
    );

    console.log("--- Transaction logged ---");
    res.status(200).send(updateResult);

  } catch (err) {
    console.error("The Try Failed", err);
    res.status(500).send({ error: 'Server error' });
  }
});


//This section will display a userlist  ************************
recordRoutes.route("/record/allAccounts").get(async (req, res) => {
    try{
      console.log("Listing specific items");
      let db_connect = dbo.getDb("accounts");
      const result =  await db_connect.collection("accounts").find({}).project({accountID:1, username:1, role:1, checkings:1, savings:1}).toArray();
      res.json(result);
      console.log(result)
    } catch(err) {
        console.log("Error fetching accounts");
        throw err;
    }
});



//This section will display a userlist  ************************
recordRoutes.route("/record/changeRole/:selectedAccountID").put(async (req, res) => {
  try {
    console.log("Entered Change Role");
    console.log("New Role Wanted: " + req.body.role);
    console.log("Selected User ID: " + req.params.selectedAccountID);
    const selectedID = parseInt(req.params.selectedAccountID);
    let db_connect = dbo.getDb("accounts");
    
    let myquery = { accountID: selectedID }; 
    const account = await db_connect.collection("accounts").findOne( myquery ); 
    if(account){
      console.log("Found account!")
      const updateResult = await db_connect.collection("accounts").updateOne(
        { accountID: selectedID },
        { $set: { role: req.body.role } }
        );
        res.status(200).json({ message: 'Role updated successfully.' });
       } else {
        console.log("Didnt work")
        res.status(404).json({ message: 'Unable to update role - Backend.' });
       }
   } catch(err) {
      console.log("Error fetching accounts");
      throw err;
  }
});



 
module.exports = recordRoutes;