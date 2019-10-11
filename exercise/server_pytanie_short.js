const mongoose = require('mongoose');
// collection.ensureIndex is deprecated. Use createIndexes instead.
mongoose.set('useCreateIndex', true);

// Zmiana referencji biblioteki na natywny Promise Node
mongoose.Promise = global.Promise;

const Schema = mongoose.Schema;

// metoda connect do połączenia się z bazą danych
mongoose.connect('mongodb://localhost/roundtable', {
  // useMongoClient: true - nie jest potrzebne od Mongo 5.x
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//new user Schema
const userSchema = new Schema({
  name: String,
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  admin: Boolean,
  created_at: Date,
  updated_at: Date
});

//Mongoose schema method
userSchema.methods.addBoyToName = function(next) {
  this.name = this.name + '-knight';
  return next(null, this.name);
};

//pre-save method
userSchema.pre('save', function(next) {
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

// Tworzymy model na podstawie schematu (nazwa kolecji bierze się od knight - mongoose dodaje 's')
const User = mongoose.model('Knight', userSchema);

// Próba D.R.Y.

// PYTANIA DO PONIŻSZEJ FUNKCJI:
// Czy muszę w tym przypadku użyć let currentUser, żeby w console.log wyświetlił się właściwy user.
// Nie mogłem użyć this.name ani self.name, bo za każdym razem wywalał mi kilka razy ostateniego usera w tym przypadku tristana.
// Czy jest na to lepszy sposób?
// Mogę oczywiście wyrzucić console.log poza .save() - ale wtedy nie jest to weryfikacja, tylko console.log obsługiwanego przez funkcję user'a.
// Wtedy wygląda to lepiej, bo każde potwierdzenie wyświetliło się po pierwszym komunikacie.
// A na chwilę obecną najpierw mam console.logi z metody addBoyToName dopisanej przez .methods, a potem mam console.logi z save'a

function newUserSave(user, userName, password) {
  this.user = new User({
    name: user,
    username: userName,
    password: password
  });
  this.user.addBoyToName(err => {
    if (err) throw err;
    console.log('Twoje nowe imię to: ' + this.user.name);
  });
  let currentUser = this.user;

  this.user.save(err => {
    if (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        return console.log('User already exist!');
      }
      throw err;
    }
    console.log('Saved user: ' + currentUser.name);
  });
}

// Tablica użytkowników, dla uproszczenia użytkownicy też w tablicach
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
