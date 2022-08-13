const bcrypt = require('bcrypt')

const HashPassword = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(12, (err, salt) => {
      if (err) {
        reject(err);
      }
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          reject(err);
        }
        resolve(hash);
      });
    });
  });
};

const ComparePassword = (password, hashed) => {
  return bcrypt.compare(password, hashed);
};
//exporting 
module.exports = {
    ComparePassword, HashPassword
}