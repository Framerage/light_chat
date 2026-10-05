import { useCallback, useEffect, useRef, useState, type FC } from "react"
import { API_URL, type IAuthInfo } from "../../App"
import styles from './index.module.scss'
import { MessagesWindow } from "./components/message-list"
import { MessageCreator } from "./components/message-creator"

export type Message = {
    id: string
    text: string
    direction: 'incoming' | 'outgoing'
    timestamp: number
}

type ReceiveNotificationResponse = {
    receiptId: number
    body: {
        typeWebhook?: string
        timestamp?: number
        idMessage?: string
        senderData?: {
            chatId?: string
            senderName?: string
            senderPhoneNumber?: number
        }
        messageData?: {
            typeMessage?: string
            textMessageData?: {
                textMessage?: string
            }
        }
    }
}

interface IProps {
    idInstance: IAuthInfo['idInstance']
    apiTokenInstance: IAuthInfo['apiTokenInstance']
    chatId: string
}
export const Chat: FC<IProps> = ({ apiTokenInstance, chatId, idInstance }) => {
    const receivingRef = useRef(false)

    // Ref на контейнер сообщений для автоматического скролла
    const messagesContainerRef = useRef<HTMLUListElement | null>(null)

    const [messages, setMessages] = useState<Message[]>([])
    const [error, setError] = useState('')

    useEffect(() => {
        const container =
            messagesContainerRef.current

        if (!container) {
            return
        }

        container.scrollTop =
            container.scrollHeight
    }, [messages])

    const deleteNotification = async (
        receiptId: number,
    ) => {
        const response = await fetch(
            `${API_URL}/waInstance${idInstance}/deleteNotification/${apiTokenInstance}/${receiptId}`,
            {
                method: 'DELETE',
            },
        )

        if (!response.ok) {
            throw new Error('Ошибка удаления уведомления')
        }
    }

    const receiveNotification = useCallback(
        async () => {
            if (
                !idInstance ||
                !apiTokenInstance ||
                !chatId
            ) {
                setError('Необходимо пройти авторизацию')
                return
            }

            // Защита от параллельных receiveNotification
            if (receivingRef.current) {
                return
            }

            receivingRef.current = true

            try {
                const response = await fetch(
                    `${API_URL}/waInstance${idInstance}/receiveNotification/${apiTokenInstance}?receiveTimeout=10`,
                )

                if (!response.ok) {
                    throw new Error('Error with receive')
                }

                const data =
                    (await response.json()) as
                    | ReceiveNotificationResponse
                    | null

                // При таймауте API может вернуть пустой ответ
                if (!data) {
                    return
                }

                const body = data.body

                // Нас интересуют только входящие сообщения
                if (
                    body?.typeWebhook !==
                    'incomingMessageReceived'
                ) {
                    await deleteNotification(data.receiptId)
                    return
                }

                const incomingChatId =
                    body.senderData?.chatId

                // Нас интересует только текущий чат
                if (
                    incomingChatId !== chatId
                ) {
                    await deleteNotification(data.receiptId)
                    return
                }

                const typeMessage =
                    body.messageData?.typeMessage

                // По заданию работаем только с текстовыми
                // сообщениями
                if (typeMessage !== 'textMessage') {
                    await deleteNotification(data.receiptId)
                    return
                }

                const text =
                    body.messageData?.textMessageData
                        ?.textMessage

                if (!text) {
                    await deleteNotification(data.receiptId)
                    return
                }

                const id =
                    body.idMessage ||
                    `${data.receiptId}-${Date.now()}`

                setMessages((prev) => {
                    // Защита от повторного добавления
                    if (
                        prev.some(
                            (item) => item.id === id,
                        )
                    ) {
                        return prev
                    }
                    prev.push({
                        id,
                        text,
                        direction: 'incoming',
                        timestamp:
                            (body.timestamp ?? 0) ||
                            Date.now(),
                    })
                    return prev
                })

                // После успешной обработки удаляем
                // уведомление из очереди
                await deleteNotification(data.receiptId)
            } catch (err) {
                setError(`ReceiveNotification error: ${err}`)
            } finally {
                receivingRef.current = false
            }
        },
        [
            idInstance,
            apiTokenInstance,
            chatId,
        ],
    )




    useEffect(() => {
        if ((!idInstance || !apiTokenInstance || !chatId)) {
            return
        }

        let cancelled = false

        const poll = async () => {
            if (cancelled) return

            await receiveNotification()

            if (cancelled) return

            // Следующий запрос запускаем только после завершения предыдущего
            setTimeout(poll, 500)
        }

        poll()

        return () => {
            cancelled = true
        }
    }, [
        idInstance,
        apiTokenInstance,
        chatId,
        receiveNotification,
    ])


    return (
        <section className={styles.appSection}>
            {error && (
                <div className={styles.alertError}>
                    {error}
                </div>
            )}
            <div className={styles.chatHeadline}>
                <h2>Сообщения</h2>
                <span className={chatId ? styles.chatStatus_online : styles.chatStatus}>
                    ● {!chatId ? 'не ' : ''}подключен
                </span>
            </div>

            <MessagesWindow containerRef={messagesContainerRef} isChatExist={!!chatId} messages={messages} />

            <MessageCreator chatId={chatId} setError={setError} setMessages={setMessages} sendApi={`${API_URL}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`} />

        </section>
    )
}