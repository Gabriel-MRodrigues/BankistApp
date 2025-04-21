'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2025-04-18T21:31:17.178Z',
    '2025-04-15T07:42:02.383Z',
    '2025-03-28T09:15:04.904Z',
    '2025-03-01T10:17:24.185Z',
    '2025-02-22T14:11:59.604Z',
    '2025-02-17T17:01:17.194Z',
    '2025-01-11T23:36:17.929Z',
    '2025-01-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2025-04-12T13:15:33.035Z',
    '2025-04-01T09:48:16.867Z',
    '2025-03-25T06:04:23.907Z',
    '2025-03-25T14:18:46.235Z',
    '2025-01-05T16:33:06.386Z',
    '2025-01-10T14:43:26.374Z',
    '2025-01-25T18:49:59.371Z',
    '2025-01-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelInvalidLogin = document.querySelector('.invalid__login');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerError = document.querySelector('.invalid__info');
const closeErrorMessage = document.querySelector('.error__closeAccount');
const transferErrorMessage = document.querySelector('.error__transferMoney');
const loanErrorMessage = document.querySelector('.error__loan');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

function displayMovements(acc, sort = false) {
  containerMovements.innerHTML = '';

  const combinedMovDates = acc.movements.map((mov, i) => ({
    movement: mov,
    movementDate: acc.movementsDates.at(i),
  }));

  // const movs = sort
  //   ? acc.movements.slice().sort((a, b) => a - b)
  //   : acc.movements;

  if (sort) combinedMovDates.sort((a, b) => a.movement - b.movement);

  combinedMovDates.forEach(function (obj, i) {
    const type = obj.movement > 0 ? 'deposit' : 'withdrawal';

    const formattedMov = formatCurrency(
      obj.movement.toFixed(2),
      acc.locale,
      acc.currency
    );

    const date = new Date(obj.movementDate);
    const displayDate = formatMovementDate(date, acc.locale);

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMov}</div>
    </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
}

displayMovements(account1);

// Creating Username for accounts
function createUsername(accs) {
  accs.forEach((acc) => {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map((name) => name[0])
      .join('');
  });
}

createUsername(accounts);

function calcDisplayBalance(acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  // labelBalance.textContent = `${acc.balance}€`;
  labelBalance.textContent = formatCurrency(
    acc.balance,
    acc.locale,
    acc.currency
  );
}

// calcDisplayBalance(account1.movements);

function calcDisplaySummary(acc) {
  const income = acc.movements
    .filter((mov) => mov > 0)
    .reduce((sum, mov) => sum + mov, 0);

  // labelSumIn.textContent = `${income}€`;
  labelSumIn.textContent = formatCurrency(income, acc.locale, acc.currency);

  const out = acc.movements
    .filter((mov) => mov < 0)
    .reduce((sum, mov) => sum + mov, 0);

  // labelSumOut.textContent = `${Math.abs(out).toFixed(2)}€`;
  labelSumOut.textContent = formatCurrency(
    Math.abs(out).toFixed(2),
    acc.locale,
    acc.currency
  );

  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100)
    .filter((int) => int >= 1)
    .reduce((sum, mov) => sum + mov);

  labelSumInterest.textContent = formatCurrency(
    interest,
    acc.locale,
    acc.currency
  );
}

// calcDisplaySummary(account1);

//Implementing Login
function userLogin(currAcc, pin) {
  if (currAcc?.pin === Number(pin)) {
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();
    containerError.style.setProperty('opacity', 0);
    containerApp.style.setProperty('opacity', 1);

    updateUI(currAcc);

    labelWelcome.textContent = `Welcome back, ${currAcc.owner.split(' ')[0]}`;
  } else {
    containerApp.style.setProperty('opacity', 0);
    containerError.style.setProperty('opacity', 1);
    labelInvalidLogin.textContent = 'User not found...';
    labelWelcome.textContent = 'Log in to get started';
    inputLoginUsername.focus();
  }
}

function updateUI(acc) {
  displayMovements(acc);
  calcDisplayBalance(acc);
  calcDisplaySummary(acc);
}

function cleanAndBlurLogin() {
  //clean and blur input Login
  inputLoginUsername.value = inputLoginPin.value = '';
  inputLoginPin.blur();
}

function cleanBoxes() {
  inputTransferAmount.value =
    inputTransferTo.value =
    inputLoanAmount.value =
    inputCloseUsername.value =
    inputClosePin.value =
      '';
}

let currentAccount, timer;

// Setting date
function formatMovementDate(date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs((date1 - date2) / 1000 / 60 / 60 / 24));
  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const day = `${date.getDate()}`.padStart(2, '0');
  // const month = `${date.getMonth() + 1}`.padStart(2, '0');
  // const year = date.getFullYear();
  const formattedDate = new Intl.DateTimeFormat(locale).format(date);
  // return `${day}/${month}/${year}`;
  return formattedDate;
}

// Formatting currency
function formatCurrency(value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
}

// Start Log out Timer
function startLogOutTimer() {
  function tick() {
    //in each second print out the remaining timer on the UI
    const minutes = `${Math.trunc(time / 60)}`.padStart(2, 0);
    const seconds = `${Math.trunc(time % 60)}`.padStart(2, 0);
    labelTimer.textContent = `${minutes}:${seconds}`;

    //when 0 seconds, stop timer and log out
    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = `Log in to get started`;
    }
    time--;
  }
  //set timer to 5 minutes
  let time = 300;
  //call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
}

btnLogin.addEventListener('click', (e) => {
  e.preventDefault();
  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value.trim()
  );
  const pin = inputLoginPin.value;

  userLogin(currentAccount, pin);
  const today = new Date();
  const options = {
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  };
  labelDate.textContent = new Intl.DateTimeFormat(
    currentAccount.locale,
    options
  ).format(today);
  // const day = `${today.getDate()}`.padStart(2, '0');
  // const month = `${today.getMonth() + 1}`.padStart(2, '0');
  // const hour = `${today.getHours()}`.padStart(2, '0');
  // const minute = `${today.getMinutes()}`.padStart(2, '0');
  // const year = today.getFullYear();
  // labelDate.textContent = `${day}/${month}/${year} - ${hour}:${minute}`;
  cleanAndBlurLogin();
  cleanBoxes();
});

function transferMoney(currAcc, receiverAcc, amount) {
  if (
    amount > 0 &&
    receiverAcc &&
    amount <= currAcc.balance &&
    receiverAcc?.username !== currAcc.username
  ) {
    // Doing the transfer
    currAcc.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Adding transfer date
    currAcc.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    updateUI(currAcc);
    clearInterval(timer);
    timer = startLogOutTimer();

    inputTransferAmount.value = '';
    transferErrorMessage.style.opacity = 0;
  } else {
    transferErrorMessage.style.opacity = 1;
    transferErrorMessage.textContent = 'Invalid Transfer';
  }
}

btnTransfer.addEventListener('click', (e) => {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    (acc) => acc.username === inputTransferTo.value.trim()
  );

  transferMoney(currentAccount, receiverAcc, amount);
});

function requestLoan(currAcc, lAmount) {
  if (lAmount > 0 && currAcc.movements.some((mov) => mov >= lAmount * 0.1)) {
    setTimeout(function () {
      currAcc.movements.push(lAmount);

      // Adding loan date
      currAcc.movementsDates.push(new Date().toISOString());

      updateUI(currAcc);

      clearInterval(timer);
      timer = startLogOutTimer();

      loanErrorMessage.style.opacity = 0;
      inputLoanAmount.value = '';
    }, 3000);
  } else {
    inputLoanAmount.value = '';
    inputLoanAmount.focus();
    loanErrorMessage.style.opacity = 1;
    loanErrorMessage.textContent = 'Invalid input for loan';
  }
}

btnLoan.addEventListener('click', (e) => {
  e.preventDefault();
  const loanAmount = Number(inputLoanAmount.value);
  requestLoan(currentAccount, loanAmount);
});

function closeAccount(username, pin) {
  const index = accounts.findIndex((acc) => acc.username === username);
  if (currentAccount.username === username && currentAccount.pin === pin) {
    containerApp.style.setProperty('opacity', 0);
    labelWelcome.textContent = 'Log in to get started';

    closeErrorMessage.style.opacity = 0;

    accounts.splice(index, 1);
  } else {
    closeErrorMessage.style.opacity = 1;
    closeErrorMessage.textContent = 'Username or pin is not matching';
  }
}

btnClose.addEventListener('click', (e) => {
  e.preventDefault();
  const username = inputCloseUsername.value.trim();
  const pin = inputClosePin.value;
  closeAccount(username, Number(pin));
});

let sorted = false;
btnSort.addEventListener('click', (e) => {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
