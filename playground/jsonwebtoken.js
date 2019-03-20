const jwt = require('jsonwebtoken');

const token = jwt.sign({ name: 'Milos', age: 27 }, '123');
const decodedToken = jwt.verify(token, '123');

console.log(decodedToken);
