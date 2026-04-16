import {
  CRText,
  InputStreamAdapter,
  ChangeStreamAdapter,
} from './dist/index.js'

const text = new CRText()
const elements = [
  document.getElementById('textarea-element'),
  document.getElementById('input-element'),
  document.getElementById('html-element'),
]

text.addEventListener('change', (event) => {
  for (const element of elements) {
    void ChangeStreamAdapter(event, element)
  }
})

for (const element of elements) {
  element.addEventListener(
    'beforeinput',
    (event) => void InputStreamAdapter(event, text)
  )
}
