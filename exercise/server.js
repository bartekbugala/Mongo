// podpinamy moduł mongoose do pliku
const mongoose = require('mongoose');
/* do stałej Schema podpinamy konstruktorm modeli 
 Wszystko w Mongoose zaczyna się od schematu,
 który mapuje się do kolekcji MongoDB i definiuje kształ dokumentów
 W obrębie kolekcji */
const Schema = mongoose.Schema;

// metoda connect do połączenia się z bazą danych
mongoose.connect('mongodb://localhost/nodeappdatabase', {
  // useMongoClient: true - nie jest potrzebne od Mongo 5.x
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
userSchema.methods.addBoyToName = function(next) {
  this.name = this.name + '-boy';

  return next(null, this.name);
};

//pre-save method
/* metoda .pre() - pochodzi z gównego konstruktora
wykonuje się przed metodą okreśoną jako parametr
W tym przypadku ustawi odpowiednie pola */
userSchema.pre('save', function(next) {
  console.log('PRE się odpala');
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
const User = mongoose.model('User', userSchema);

const kenny = new User({
  name: 'Kenny',
  username: 'Kenny_the_boy',
  password: 'password'
});

kenny.addBoyToName((err, name) => {
  if (err) throw err;
  console.log('Twoje imię to: ' + name);
});

kenny.save(err => {
  if (err) throw err;
  console.log('Użytkownik zapisany pomyślnie');
});

const benny = new User({
  name: 'Benny',
  username: 'Benny_the_boy',
  password: 'password'
});

benny.addBoyToName(function(err, name) {
  if (err) throw err;
  console.log('Twoje nowe imię to: ' + name);
});

benny.save(function(err) {
  if (err) throw err;

  console.log('Uzytkownik ' + benny.name + ' zapisany pomyslnie');
});

const mark = new User({
  name: 'Mark',
  username: 'Mark_the_boy',
  password: 'password'
});

mark.addBoyToName(function(err, name) {
  if (err) throw err;
  console.log('Twoje nowe imię to: ' + name);
});

mark.save(function(err) {
  if (err) throw err;

  console.log('Uzytkownik ' + mark.name + ' zapisany pomyslnie');
});
