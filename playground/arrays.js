const _ = require('lodash');

const cons = { _id: 123233, name: 'Super Nintendo' };

console.log(_.pick(cons, ['name', 'kurac']));
