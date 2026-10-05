import { useState, type Dispatch, type FC, type SetStateAction } from "react"
import type { Message } from "../.."
import styles from './index.module.scss'

interface IProps {
    chatId?: string
    setError: (v: string) => void
    sendApi: string
    setMessages: Dispatch<SetStateAction<Message[]>>
}
export const MessageCreator: FC<IProps> = ({ chatId, setError, sendApi, setMessages }) => {

    const [message, setMessage] = useState('')
    const [isSending, setIsSending] = useState(false)

    const sendMessage = async () => {
        setError('')

        const text = message.trim()

        if (!chatId) {
            setError('Сначала создайте чат')
            return
        }

        if (!text) {
            return
        }

        if (text.length > 4000) {
            setError(
                'Сообщение не должно превышать 4000 символов',
            )
            return
        }

        setIsSending(true)

        try {
            const response = await fetch(
                sendApi,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        chatId,
                        message: text,
                    }),
                },
            )

            if (!response.ok) {
                throw new Error('Error with sending')
            }

            const data = await response.json()

            if (!data?.idMessage) {
                throw new Error('GREEN-API не вернул idMessage')
            }

            setMessages((prev) => [
                ...prev,
                {
                    id: data.idMessage,
                    text,
                    direction: 'outgoing',
                    timestamp: Date.now(),
                },
            ])

            setMessage('')
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось отправить сообщение',
            )
        } finally {
            setIsSending(false)
        }
    }

    const handleMessageKeyDown = (
        event: React.KeyboardEvent<HTMLTextAreaElement>,
    ) => {
        if (
            event.key === 'Enter' &&
            !event.shiftKey
        ) {
            event.preventDefault()

            if (!isSending) {
                sendMessage()
            }
        }
    }
    return (
        <div className={styles.creatorContainer}>
            <textarea
                className={styles.messageFiled}
                value={message}
                onChange={(event) =>
                    setMessage(
                        event.target.value,
                    )
                }
                onKeyDown={
                    handleMessageKeyDown
                }
                disabled={!chatId || isSending}
                placeholder={
                    chatId
                        ? 'Введите сообщение...'
                        : 'Сначала создайте чат'
                }
                rows={3}
            />

            <button
                className={styles.sendBtn}
                type="button"
                onClick={sendMessage}
                disabled={
                    !chatId ||
                    !message.trim() ||
                    isSending
                }
            >
                {isSending
                    ? 'Отправка...'
                    : 'Отправить'}
            </button>
        </div>
    )
}