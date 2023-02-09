
// This is the old version of the application when we were dealing direct with json data in the application 

const usersDB = {
    users: require('../model/users.json'),
    setUsers: function (data) { this.users = data }
}

// this is only to mock a data base, this will be replaced with a mongoDB etc
const fsPromises = require('fs').promises;
const path = require('path');

const handleLogout = async (req, res) => {
    // On client, also delete the access token

    const cookies = req.cookies;

    if(!cookies?.jwt) return res.sendStatus(204); //No content
   
    const refreshToken = cookies.jwt;

    // Is refresh token in the DB?

    const foundUser = usersDB.users.find(person => person.refreshToken === refreshToken);
    if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
        return res.sendStatus(204); 
    }
    
    //Delete refreshToken in the DB here
    const otherUsers = usersDB.users.filter(person => person.refreshToken !== foundUser.refreshToken);
    const currentUser = {...foundUser, refreshToken: ''};
    usersDB.setUsers([...otherUsers, currentUser]);
    await fsPromises.writeFile(path.join(__dirname, '..', 'model', 'users.json'), JSON.stringify(usersDB.users));

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true }); // In development secure: true - only servers on https

    res.sendStatus(204);
    
}

module.exports = { handleLogout };