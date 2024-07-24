const express = require('express')
const recordRoutes = express.Router()
const dbo = require('../db/conn')

 
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

 let myobj = {
   username: req.body.username,
   password: req.body.password,
   role: req.body.role,
   checkings: 0,
   savings: 0,
 };


 let myquery = { username: req.body.username}; //search for email from body
 const account = await db_connect.collection("records").findOne(myquery); 
 console.log("Account: " + account)
 if(account != null){
    console.log("Unsername already exists") 
    return await res.status(400).json({ message: "Username already exists" })

 } 
 

 else{
    const result = await db_connect.collection("accounts").insertOne(myobj); //otherwise it inserts into db
    console.log(" ------- inside create -------------")
    console.log("username added to database")
    let myquery = { email: req.body.username, password: req.body.password}; 
    const account = await db_connect.collection("records").findOne( myquery ); 
    console.log(account.id)
    console.log("session Id is set too: " + req.session.myID)
    console.log("account _id is set too: " + account._id)
    console.log("account id is set too: " + account.id)
    req.session.myID = account._id;
    console.log("session Id is set too: " + req.session.myID)
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
   req.session.role = account.role; //Create the session!
   console.log("session Id is set too: " + req.session.myID)
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
 

/////////////////////////
//  tutorial provided  //
//                     //
/////////////////////////
 
// This section will help you update a record by id.
recordRoutes.route("/update/:id").put(async (req, res) => {
    try{
 let db_connect = dbo.getDb();
 let myquery = { _id: new ObjectId(req.params.id) };
 let newvalues = {
   $set: {
     name: req.body.name,
     position: req.body.position,
     level: req.body.level,
   },
 };
 const result = await db_connect.collection("records").updateOne(myquery, newvalues);
 console.log("1 document updated");
 res.json(result);
} catch (err){
    throw err;
}
});
 
// This section will help you delete a record

recordRoutes.route("/:id").delete((req, res) => {
    try{
        let db_connect = dbo.getDb();
        let myquery = { _id: new ObjectId(req.params.id) };
        const result =  db_connect.collection("records").deleteOne(myquery);
          console.log("1 document deleted")
          res.json(result);
    } catch (err){
        throw err;
    }

});


/////////////////////////
//  tutorial provided  //
//                     //
/////////////////////////
 
// This section will help you get a list of all the records.
recordRoutes.route("/record").get(async (req, res) => {
   try{
   console.log("In record GET route");
let db_connect = dbo.getDb("employees");
const result =  await db_connect.collection("records").find({}).toArray();
console.log("Got result");
res.json(result);
} catch (err) {
   throw err;
} //end of try catch
});


/////////////////////////
//  tutorial provided  //
//                     //
/////////////////////////

// This section will help you get a single record by id
// recordRoutes.route("/record/:id").get(async (req, res) => {
// try {
//     let db_connect = dbo.getDb();
//    //  let myquery = { _id: new ObjectId(req.params.id) };
   
//     const result = await db_connect.collection("records").findOne(myquery);
//     console.log(result)
//     console.log(myquery)
//     console.log("Got result by ID");
//     res.json(result);
// } catch(err){
//     throw err;
// }
// });


/////////////////////////
//  tutorial provided  //
//                     //
/////////////////////////

// This section will help you create a new record. ******************************
recordRoutes.route("/record/add").post(async (req, res) => {
  try{
let db_connect = dbo.getDb();
let myobj = {
 name: req.body.name,
 position: req.body.position,
 level: req.body.level,
};
  const result = await db_connect.collection("records").insertOne(myobj); //otherwise it inserts into db
  res.json(result)
  } catch(err) {
      throw err;
  }
});
 
module.exports = recordRoutes;