// CALCULATOR PROGRAM
const display = document.getElementById('display');

function appendToDisplay(input) {
  display.value += input;
}

function clearDisplay() {
  display.value = '';
}

function calculate() {
  try {
    // eval: Evaluate the mathematical expression in the display
    // and return the result
    display.value = eval(display.value);
  } catch (error) {
    display.value = 'Error';
  }
}
