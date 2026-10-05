import type { FC, RefObject } from "react"
import type { Message } from "../.."
import styles from './index.module.scss'

const MessageItem = ({ item }: { item: Message }) => {
    return (
        <li
            key={item.id}
            className={`${styles.message} ${styles.message}--${item.direction}`}
        >
            <div className={styles.message__text}>
                {item.text}
            </div>

            <div className={styles.message__time}>
                {new Date(
                    item.timestamp,
                ).toLocaleTimeString(
                    'ru-RU',
                    {
                        hour: '2-digit',
                        minute: '2-digit',
                    },
                )}
            </div>
        </li>
    )
}
const Notice = ({ text }: { text?: string }) => {
    return (
        <li className={styles.notice}>
            {text}
        </li>
    )
}
interface IWindowProps {
    isChatExist?: boolean
    messages: Message[]
    containerRef: RefObject<HTMLUListElement | null>
}


export const MessagesWindow: FC<IWindowProps> = ({ messages, isChatExist = false, containerRef = null }) => {
    return (
        <ul
            ref={containerRef}
            className={styles.listContainer}
        >
            {!isChatExist && (<Notice text='Создайте чат, чтобы начать переписку' />)}

            {isChatExist && messages.length === 0 && (<Notice text='Пока нет сообщений' />)}

            {messages.map((item) => (
                <MessageItem item={item} />
            ))}
        </ul>
    )
}