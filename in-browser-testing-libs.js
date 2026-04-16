import {
  CRText,
  InputStreamAdapter,
  ChangeStreamAdapter,
} from './dist/index.js'

const text = new CRText()
const elements = Array.from(document.querySelectorAll('body > *')).slice(0, 3)

text.addEventListener('change', (event) => {
  for (const element of elements) {
    ChangeStreamAdapter(event, element)
  }
})

for (const element of elements) {
  element.addEventListener('beforeinput', (event) =>
    InputStreamAdapter(event, text)
  )
}
