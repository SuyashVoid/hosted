// Your JSON data as a JS object
const characters = [
  {"id": "c3", "image": "media/x0.jpg", "name": "Ariane Lockwood"},
  {"id": "c2", "image": "media/x1.jpg", "name": "Illeana Maximillian"},
  {"id": "c7", "image": "media/x2.jpg", "name": "Unrevealed"},
  {"id": "c8", "image": "media/x3.jpg", "name": "Unrevealed"},
  {"id": "c6", "image": "media/y0.jpg", "name": "Vern Lockwood"},
  {"id": "c5", "image": "media/y1.jpg", "name": "Hensen Vehen"},
  {"id": "c4", "image": "media/y2.jpg", "name": "Unrevealed"}
];

const tbc = [{"id": "c9", "image": "media/tbc.jpg", "name": "To Be Continued"}]

// Fisher-Yates shuffle algorithm
function shuffle(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;

  while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
  }

  return array;
}

// Function to generate HTML for one character
function generateCharacterHTML(character) {
  let radioInput = document.createElement('input');
  radioInput.setAttribute('type', 'radio');
  radioInput.setAttribute('id', character.id);
  radioInput.setAttribute('name', 'ts');

  let label = document.createElement('label');
  label.setAttribute('class', 't');
  label.setAttribute('for', character.id);

  let image = document.createElement('img');
  image.setAttribute('src', character.image);

  let span = document.createElement('span');
  span.setAttribute('class', 'characterName');
  span.textContent = character.name;

  label.appendChild(image);
  label.appendChild(span);

  return [radioInput, label];
}

// Generate HTML from data
function generateHTML(data) {
  const container = document.getElementsByClassName('thumbnail-bar')[0]; // select the parent container
  data = shuffle(data); // shuffle data before generating HTML
  data.push(tbc[0]); // add TBC image to the end of the array

  data.forEach(character => {
      const [radioInput, label] = generateCharacterHTML(character);
      container.appendChild(radioInput);
      container.appendChild(label);
  });
}

// Use your JSON data to generate the HTML
generateHTML(characters);

const thumnialCount = 4.5;
const els = document.querySelectorAll("[type='radio']");
for (const el of els)
  el.addEventListener("input", e => reorder(e.target, els));
reorder(els[0], els);

function reorder(targetEl, els) {
  const nItems = els.length;
  let processedUncheck = 0;
  for (const el of els) {
    const containerEl = el.nextElementSibling;
    if (el === targetEl) {//checked radio
      containerEl.style.setProperty("--w", "100%");
      containerEl.style.setProperty("--l", "0");
    }
    else {//unchecked radios

      containerEl.style.setProperty("--w", `${80/(thumnialCount-1)}%`);
      containerEl.style.setProperty("--l", `${processedUncheck * 100/(thumnialCount-1)}%`);
      processedUncheck += 1;
    }
  }
}

