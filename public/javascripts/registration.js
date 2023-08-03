////////////////////////DOM Elements//////////////////////
let formEl = document.getElementById("form");
let messageEl = document.getElementById("message");
let messagecontainerEl = document.querySelector(".message-container");
let password1 = document.getElementById("password1");
let password2 = document.getElementById("password2");
let passwords = document.querySelectorAll(".password");

///////////////////Flags/variables//////////////////////////
let isValid = false;
let passwordofMatch = false;
let storeData = {};
const updateClasses = (domElement, addClass, removeClass) => {
  domElement.classList.remove(removeClass);
  domElement.classList.add(addClass);
};
const updateMessage = (message) => {
  messageEl.innerHTML = message;
};
//////ValiateForm -validating form before we store the data//////////
const validateForm = () => {
  isValid = formEl.checkValidity();
  console.log(isValid);
  if (!isValid) {
    //   updateMessage("Something Is Wrong");
    //    updateClasses(messagecontainerEl, "fail", "pass");
    return false;
  } else {
    //updateMessage("Registration successfull");
    //  updateClasses(messagecontainerEl, "pass", "fail");
    return true;
  }
};
// ///////////////Check The Password///////////////////////////
const checkPassword = () => {
  let password1Value = passwords[0].value;
  let password2Value = passwords[1].value;
  if (password1Value === password2Value) {
    updateClasses(messagecontainerEl, "pass", "fail");
    passwords.forEach((password) => {
      updateClasses(password, "pass", "fail");
    });
    return true;
  } else {
    messageEl.innerHTML = "password mis match found";
    updateClasses(messagecontainerEl, "fail", "pass");

    passwords.forEach((password) => {
      updateClasses(password, "fail", "pass");
    });
    return false;
  }
};
checkPassword();
// /////////Storing Data//////////////////

const storeFormData = () => {
  storeData = {
    fullName: formEl.name.value,
    phNumber: formEl.phone.value,
    emailAddress: formEl.email.value,
    password: formEl.password1.value,
  };
  console.log(storeData);
};

// //////////ProccessFormData  function for processing form data///////////
// const processFormData = (e) => {
//   e.preventDefault();
//   validateForm();
checkPassword();
//   let check1 = validateForm();
//   let check2;
//   if (check1 === true) {
//     check2 = checkPassword();
//   }

//   check1 === true && check2 === true ? storeFormData() : "";
//   if (check1 === true && check2 === true) {
//     storeFormData();
//   } else {
//   }
// };
// /////////////Submit//////////////////////////

formEl.addEventListener("submit", processFormData);
