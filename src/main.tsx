import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { I18nProvider } from './i18n'
import { AuditProvider } from './data/AuditContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuditProvider>
      <I18nProvider>
        <App />
      </I18nProvider>
    </AuditProvider>
  </React.StrictMode>,
)
