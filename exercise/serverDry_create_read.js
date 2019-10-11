// podpinamy moduł mongoose do pliku
const mongoose = require('mongoose');

// collection.ensureIndex is deprecated. Use createIndexes instead.
mongoose.set('useCreateIndex', true);

// Zmiana referencji biblioteki na natywny Promise Node
mongoose.Promise = global.Promise;

/* do stałej Schema podpinamy konstruktorm modeli 
 Wszystko w Mongoose zaczyna się od schematu,
 który mapuje się do kolekcji MongoDB i definiuje kształ dokumentów
 W obrębie kolekcji */
const Schema = mongoose.Schema;

// metoda connect do połączenia się z bazą danych
mongoose.connect('mongodb://localhost/roundtable', {
  // useMongoClient: true - nie jest potrzebne od Mongo 5.x
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//new user Schema
// Schemat dla przykładowej aplikacji, tworzącej userów
const userSchema = new Schema({
  name: String,
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  admin: Boolean,
  created_at: Date,
  updated_at: Date
});

//Mongoose schema method
// dodajemy do modeulu funkcję, która zmodyfikuje imię użytkownika podczas tworzenia instancji
userSchema.methods.addBoyToName = next => {
  this.name = this.name + '-boy';
  return next(null, this.name);
};

//pre-save method
/* metoda .pre() - pochodzi z gównego konstruktora
wykonuje się przed metodą okreśoną jako parametr
W tym przypadku ustawi odpowiednie pola */
userSchema.pre('save', next => {
  // pobranie aktualnego czasu
  const currentDate = new Date();

  // zmiana pola na aktualny czas
  this.updated_at = currentDate;
  if (!this.created_at) {
    this.created_at = currentDate;
  }

  // next() jest funckją która przechodzi do następnego hooka do wykonania przed lub po requeście
  next();
});

// Tworzymy model na podstawie schematu
const User = mongoose.model('Knight', userSchema);

// D.R.Y. :)
function newUserSave(user, userName, password) {
  user = new User({
    name: user,
    username: userName,
    password: password
  });

  user.addBoyToName(err => {
    if (err) throw err;
    console.log('Twoje nowe imię to: ' + user.name);
  });

  user.save(err => {
    if (err) {
      if (/* err.name === 'MongoError' &&  */ err.code === 11000) {
        return console.log('User already exist!');
      }
      throw err;
    }
    console.log('Uzytkownik ' + user.name + ' zapisany pomyslnie');
  });
}

const userArrays = [
  ['Robin', 'brave_sir_Robin', 'grail'],
  ['Arthur', 'Arthur_the_king', 'grail'],
  ['Richard', 'Richard_the_knight', 'grail'],
  ['Lancelot', 'Lancelot_the_knight', 'grail'],
  ['Parcival', 'Parcival_the_knight', 'grail'],
  ['Tristan', 'Tristan_the_knight', 'grail']
];

// POPULATE DB COLLECTION
function populatedB(array) {
  array.forEach(usr => newUserSave(usr[0], usr[1], usr[2]));
}
const promise1 = new Promise((resolve, reject) => {
  populatedB(userArrays);
  resolve();
});

promise1.then(function() {
  findUsers({ username: 'Arthur_the_king' });
});

/* User.find({}, (err, res) => {
  if (err) throw err;
  console.log('Actual database records are ' + res);
}); */

function findUsers(dbQuery = null) {
  const query = User.find(dbQuery);
  const promise = query.exec();
  promise.then(records => {
    console.log('Found records ' + records);
  });
  promise.catch(reason => {
    console.log('Something went wrong: ', reason);
  });
  return;
}
