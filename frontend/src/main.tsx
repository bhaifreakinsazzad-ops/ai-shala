import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

if ('serviceWorker' in navigator) {
  const registerSw = () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Installability degrades gracefully if this fails — the app still works, just not offline/installable.
    })
  }
  // This is a `type="module"` script, which executes after the document is
  // parsed — often at or after `window`'s `load` event already fired, so
  // `addEventListener('load', ...)` here would silently never run.
  if (document.readyState === 'complete') {
    registerSw()
  } else {
    window.addEventListener('load', registerSw)
  }
}
