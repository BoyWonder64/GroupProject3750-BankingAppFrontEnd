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
   accountID: accountNum
 };




 console.log("----Begin Body Grab----")
 console.log(req.body.username)
 console.log(req.body.password)
 console.log(req.body.role)
 console.log("----end of body grab----")


 let myquery = { username: req.body.username}; //search for username from body
 const account = await db_connect.collection("accounts").findOne(myquery); 


 if(account != null){
    console.log("Username already exists") 
    return await res.status(400).json({ message: "Username already exists" })
 } 

 else{
  console.log("Inside the Else Statement")
  let accountIDQuery = {accountID: accountNum}

  while (!flag) {
    console.log("inside the While stmt");

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

 let myquery = { username: req.body.username, password: req.body.password}; 
 const account = await db_connect.collection("accounts").findOne( myquery ); 
 if(account){ //if its not empty ie if it exists
   console.log("successfully logged in")
   console.log(account.username, " ", account.role)
   req.session.accountID = account.accountID //create an accountID session
   req.session.role = account.role; //Create the session based on the role!
   console.log("session Id is set too: " + req.session.role)
   console.log("End of Login")
   res.send(account); //send account back to account Summary Page
 } else {
   console.log("unsuccessfully logged in")
   res.status(200).json({ message: "unsuccessfully logged in" })

 }
    } catch(err) {
      res.status(200).json({ message: "unsuccessfully logged in" })
        throw err;
    }
});


//This section will serve as the logic to help determine what role they have **************************************
recordRoutes.route("/record/determineRole").get(async (req, res) => {
  try{
     console.log("in /determineRole")
     let db_connect = dbo.getDb();
     console.log("Role for user is: "+ req.session.role)
if(!req.session.role){
  return res.status(201).send({ message: 'Role Not Set!!' })
}
console.log("Role was found")
const user = await db_connect.collection("accounts").findOne( {accountID: new ObjectId(req.session.accountID)}); 

res.send(user.role);

  } catch(err) {
      throw err;
  }
});


recordRoutes.route("/record/logout").post(async (req, res) => {
   try{
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
      console.log("in /accountSummary")
      let db_connect = dbo.getDb();
      console.log("sessionID: in accountSummary: "+ req.session.myID)
if(!req.session.myID){
   return res.status(201).send({ message: 'Session Not Set!!' })
}
console.log("sessionID was found")
const user = await db_connect.collection("accounts").findOne( {_id: new ObjectId(req.session.myID)}); 

console.log("session: "+ req.session.myID)
res.send(user);

   } catch(err) {
       throw err;
   }
});

recordRoutes.route("/record/transaction").post(async (req, res) => {
  const { accountID, type, account, amount } = req.body; //We may need to figure out a better way to get the user information
  const timestamp = new Date().toISOString(); //Grabs the timestamp 
  transactions.push({ accountID, type, account, amount, timestamp }); //Push the information onto the array
  res.status(200).json({ message: "transaction logged" })
  })//End of Transactions


recordRoutes.route("/record/transactionHistory").get(async (req, res) => {
  const { accountID } = req.body; //So we need to figure out 
  const userTransactionHistory = transactions.filter(transaction => transaction.accountID == accountID);
  res.json(userTransactionHistory);
});

//This section will serve as the logic for the backend accountSummary **************************************
recordRoutes.route("/record/accountSummary/bankingSummary").post(async (req, res) => {
  const { transactionType, amount, account } = req.body

  try {
    let db_connect = dbo.getDb();
  console.log("--- Inside of Banking Summary ---")
   if (!req.session.myID) {
      return res.status(201).send({ message: 'Session Not Set!!' })
    }
  console.log("session ID is set")
  console.log("Session is: " + req.session.myID)
  console.log("Type is : "+ transactionType)
  console.log("account is: " + account)
  console.log("amount is: " + amount)


    
      const databaseAccount = await db_connect.collection("records").findOne({ _id: new ObjectId(req.session.myID)})
        console.log("account has been found: " + databaseAccount.firstName )

      if (!databaseAccount) {
        console.log("JK, account was not found")
        return res.status(401).send({ message: 'User is not in database' })
      }

      if(transactionType === "deposit"){
        const increaseValue = Number(amount)
        console.log("We made it into the deposit if")
        if(account === "savings"){
          const result = await db_connect.collection("records").updateOne(databaseAccount,{ $inc: { savings: increaseValue } }); //$inc is + operator more or less
          res.send(result)
        } else {
          const result = await db_connect.collection("records").updateOne(databaseAccount,{ $inc: { checkings: increaseValue } }); //$inc is + operator more or less
          res.send(result)
        }   
        console.log("Deposit has been used")
      }

      if(transactionType === "withdraw"){ //using the [] helps reference the body but sets can reference the account
        let decreaseValue = Number(amount)
        console.log("Withdraw amount is: " + decreaseValue)
        console.log("We made it into the withdraw if")

        if(account === "savings"){
          console.log("Withdrawing from savings...")
          if(databaseAccount.savings > decreaseValue && decreaseValue !=0){
            console.log("Savings second if Statement works!")
            console.log("Savings is currently: " + databaseAccount.savings)
             decreaseValue = databaseAccount.savings - decreaseValue;
            console.log("Savings will now be: " + decreaseValue)
            const result = await db_connect.collection("records").updateOne(databaseAccount, {$set: { savings: decreaseValue }});
            res.send(result)
          }
        } 
        if(account === "checking") {
          console.log("Withdrawing from checking...")
          if(databaseAccount.checkings > decreaseValue && decreaseValue !=0){
            console.log("Checking second if Statement works!")
            console.log("Checking is currently: " + databaseAccount.checkings)
             decreaseValue = databaseAccount.checkings - decreaseValue;
            console.log("Checking will now be: " + decreaseValue)
            const result = await db_connect.collection("records").updateOne(databaseAccount, {$set: { checkings: decreaseValue }});
            res.send(result)
          }
        }
        console.log("Withdraw has been used")
      }
      console.log("Refreshed Account")
   
  
    } catch (err) {
      console.log("The Try Failed")
      res.status(500).send({ error: 'Server error' })
    }
  })



//This section will display a userlist  ************************
recordRoutes.route("/list").get(async (req, res) => {
    try{
        console.log("Listing specific items");
       let db_connect = dbo.getDb("employees");
       const result =  await db_connect.collection("records").find({}).project({email:1, role:1, checkings:1, savings:1}).toArray();
       res.json(result);
       console.log(result)
    } catch(err) {
        throw err;
    }
});

// This section will help you update a role by email. ************************
recordRoutes.route("/update/:email").patch(async (req, res) => {
   let roleMessage = { message: "Role Updated"}; // create message
    try{
 let db_connect = dbo.getDb();
 const emailacc = req.params.email;
 let myquery = { email: emailacc};
 let newvalues = {
   $set: {
     role: req.body.role,
   },
 };
 const result = await db_connect.collection("records").updateOne(myquery, newvalues);
 console.log("1 document updated");
 res.send(roleMessage);
 
} catch (err){
    throw err;
}
});
 



// This section will depoist money based off the body given. ************************
recordRoutes.route("/deposit").patch(async (req, res) => {
    try{
 let depositMessage = { message: "deposit sucessful"}; // create message

 let db_connect = dbo.getDb();
 const emailacc = req.body.email; //grab supplied email
 const savingsNewDep = req.body.savings;
 const checkingNewDep = req.body.checkings;
 let myquery = { email: emailacc}; //search for email in db
 const account = await db_connect.collection("records").findOne(myquery); //store the info into account

 if(savingsNewDep > 0){
    const increaseValue = req.body.savings;
    const result = await db_connect.collection("records").updateOne(account,{ $inc: { savings: increaseValue } }); //$inc is + operator more or less

    res.send(depositMessage)
    console.log("balanced updated by " + increaseValue);
 } 
 else if(checkingNewDep > 0){
    const increaseValue = req.body.checkings;
    const result = await db_connect.collection("records").updateOne(account,{ $inc: { checkings: increaseValue } } );

    res.send(depositMessage)
    console.log("balanced updated by " + increaseValue);
 }
 
} catch (err){
    throw err;
}
});
 



// This section will withdraw money based off the email. ************************
recordRoutes.route("/withdraw").patch(async (req, res) => {
    try{
 let db_connect = dbo.getDb();
 let withdrawMessage = { message: "withdraw sucessful"}; // create message
 let zerobalanceMessage = { message: "Unable to perform transaction - result is negative balance"}; // create message
 const emailacc = req.body.email; //grab email from input
 const savingsWithdraw = req.body.savings; 
 const checkingWithdraw = req.body.checkings;
 let myquery = { email: emailacc}; //search for the account
 const account = await db_connect.collection("records").findOne(myquery); 

 if(account.savings > savingsWithdraw && savingsWithdraw !=0){ //what they take isnt greater than what they have
    const decreaseValue = account.savings - savingsWithdraw;
    const result = await db_connect.collection("records").updateOne(account, {$set: { savings: decreaseValue }});

    res.send(withdrawMessage);
    console.log("Savings balanced updated to " + decreaseValue);
 } 
 else if(account.checkings > checkingWithdraw && checkingWithdraw !=0){
    const decreaseValue = account.checkings - checkingWithdraw;
    const result = await db_connect.collection("records").updateOne(account, {$set: {checkings: decreaseValue }});

    res.send(withdrawMessage);
    console.log("Checking balanced updated to " + decreaseValue);
 }
 else {
    res.send(zerobalanceMessage)
 }

} catch (err){
    throw err;
}
});
 



// This section will transfer money from one account to the other ************************
//This assumes that you will be only providing a single amount
recordRoutes.route("/transfer").post(async (req, res) => {
    try{
 let db_connect = dbo.getDb();
 let transferMessage = { message: "transfer sucessful"}; // create message
 let unableMessage = { message: "transfer exceeds avaiable funds"}; // create message
 const emailacc = req.body.email;
 const savingsTransfer = req.body.savings;
 const checkingTransfer = req.body.checkings;
 let myquery = { email: emailacc};
 const account = await db_connect.collection("records").findOne(myquery);


 if(savingsTransfer < account.savings && savingsTransfer != 0) { //transfer into checking
      const transferValue = account.checkings + savingsTransfer;
      const subtractValue = account.savings - savingsTransfer;
      let newvalues = {
         $set: {checkings: transferValue, 
               savings: subtractValue
         },};

      const result = await db_connect.collection("records").updateOne(account, newvalues);
      res.send(transferMessage);
      console.log("Checking balance updated to " + transferValue);
      console.log("Savings balance updated to " + subtractValue);
      
 } 
 else if(checkingTransfer < account.checkings && checkingTransfer != 0) {
      const transferValue1 = account.savings + checkingTransfer;
      const subtractValue1 = account.checkings - checkingTransfer;

         const result = await db_connect.collection("records").updateOne(account, {$set: {savings: transferValue1, checkings: subtractValue1 }});
      res.send(transferMessage);
      console.log("Savings balance updated to " + transferValue1);
      console.log("Checking balance updated to " + subtractValue1);


 } else {
   res.send(unableMessage);
 }

} catch (err){
    throw err;
}
});
 




 
module.exports = recordRoutes;