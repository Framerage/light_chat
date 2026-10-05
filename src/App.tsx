import { useState } from 'react'
import './App.css'
import { LoginForm } from './components/login_form'
import { Chat } from './components/chat'

//данный формат в качестве тестового примера, в реальном проекте переменная была бы в .env
export const API_URL = 'https://api.green-api.com'

export interface IAuthInfo {
  idInstance: string,
  apiTokenInstance: string
}
function App() {
  const [authInfo, setAuthInfo] = useState<IAuthInfo>({ apiTokenInstance: '', idInstance: '' })
  const [chatId, setChatId] = useState('')

  return (
    <main className="layout">
      <h1 className="app__title">
        Light chat like a MAX
      </h1>

      <LoginForm setChatId={setChatId} setAuthInfo={setAuthInfo} />

      <Chat
        apiTokenInstance={authInfo?.apiTokenInstance}
        idInstance={authInfo?.idInstance}
        chatId={chatId}
      />
    </main>
  )
}

export default App