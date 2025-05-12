import '@babel/polyfill';
//to run new features of js in older browser
import { login, logout, signUp } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';

//DELEGATION
const loginForm = document.querySelector('.form');
const logOutButton = document.querySelector('.nav__el--logout');
const signUpForm = document.querySelector('#form--signUp');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.querySelector('#book-tour');

if (loginForm) {
  console.log('login running');
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    //VALUES
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log('running loginform');
    login(email, password);
  });
}

if (logOutButton) {
  logOutButton.addEventListener('click', logout);
}

if (signUpForm) {
  console.log('signup running');
  signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    //VALUES
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const password = document.getElementById('password').value;

    const form = {
      name,
      email,
      role,
      passwordConfirm,
      password,
    };
    console.log(form);
    signUp(form);
  });
}

if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    updateSettings(form, 'data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    updateSettings({ currentPassword, password, passwordConfirm }, 'password');
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    bookBtn.textContent = 'Processing';
    const { tourId } = e.target.dataset;
    console.log(tourId);
    bookTour(tourId);
  });
}
