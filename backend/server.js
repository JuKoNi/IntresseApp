const express = require('express');
const nedb = require('nedb-promise');
const cors = require('cors');
const app = express();

// säg till servern att alla får utnjyttja vårt API
app.use(cors({origin: '*'}));
app.use(express.json());

// en databas för konton
const accountsDB = new nedb({filename: 'accounts.db', autoload: true});

//en databas för intressen länkade till ett konto
const interestsDB = new nedb({filename: 'interests.db', autoload: true});

// skapa konto - endpoint
app.post('/signup', async (request, response) => {
    // vi kommer få in användarens anv.namn och lösen i en body
    const credentials = request.body;
    console.log(credentials)
    const responseObject = {
        success: true,
        usernameExists: false
    };
    // kolla igenom databasen om användarnamnet som skickats in redan existerar
    const usernameExists = await accountsDB.find({ username: credentials.usename });
    // .find() returnerar en lista på alla träffar
    if ( usernameExists.length > 0 ) {
        responseObject.usernameExists = true;
    }
    if ( responseObject.usernameExists ) {
        responseObject.success = false;
    } else {
        // om användarnamn är unikt tjoffa in i account.db
        // hasha vårt lösenord vid bcrypt eller liknande
        accountsDB.insert(credentials);
    }
    response.json(responseObject);
});
// logga in
app.post('/login', async (request, response) => {
    // vi kommer få in användarens anv.namn och lösen i en body
    const credentials = request.body;

    const responseObject = {
        success: false,
        user: '',
        interests: []
    }
    console.log(credentials);
    // kollar mot accounts.db om användare med namnet finns
    const account = await accountsDB.find({$and: [{username: credentials.username}, {password: credentials.password}] }); 
    if (account.length > 0) {

            console.log('korrekt lösenord', account[0]);
            responseObject.user = account[0].username;
            responseObject.success = true;
            // vi vill kolla om användaren har intressent
            // om det finns; skicka med i responseObject
    } else {
        responseObject.success = false;
    }
    response.json(responseObject);
});
// lägga till intressen
app.post('/addinterest', async (request, response) => {
    const requestData = request.body;
    let userInterestObject = {
        user: requestData.user,
        interests: [requestData.interest]
    };
    console.log(userInterestObject);
    const responseObject = {
        success: true,
    };
    // vi vill kolla om användaren redan har inlagda intressen
    const userHasInterests = await interestsDB.find({ user: userInterestObject.user });
    if (userHasInterests.length > 0) {
        // om det finns ska vi bara uppdatera dennes record i interests.db
        let user = userHasInterests[0].user;
        interestsDB.update(
            {user: user}, 
            {$push: {interests: requestData.interest}}
        );
    } else {
        // om det inte finns, bara lägga in ett nytt record med anv.namn + intresselista
        interestsDB.insert(userInterestObject);
    }
    response.json(responseObject);
});
// hitta matchande intressen

// starta servern
app.listen(1234, () => {
    console.log('Server is running on port 1234');
})