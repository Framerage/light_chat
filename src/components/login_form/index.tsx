import { useState, type FC } from 'react'
import styles from './index.module.scss'
import { API_URL, type IAuthInfo } from '../../App'
import { AuthInput } from './components/auth-input'

interface IProps {
    setChatId: (v: string) => void
    setAuthInfo: (v: IAuthInfo) => void
}
export const LoginForm: FC<IProps> = ({ setChatId, setAuthInfo }) => {

    const [idInstance, setIdInstance] = useState('')
    const [apiTokenInstance, setApiTokenInstance] = useState('')
    const [phone, setPhone] = useState<string>('')
    const [error, setError] = useState('')
    const [isCreatingChat, setIsCreatingChat] = useState(false)
    const [isAnyValueInProcess, setIsAnyValueInProcess] = useState(false)

    const onCreateChat = async () => {

        if (!idInstance.trim()) {
            setError('Введите idInstance')
            return
        }

        if (!apiTokenInstance.trim()) {
            setError('Введите apiTokenInstance')
            return
        }

        if (!phone) {
            setError('Введите номер телефона')
            return
        }

        if (
            !/^7\d{10}$/.test(phone) &&
            !/^375\d{9}$/.test(phone)
        ) {
            setError(
                'Введите номер в международном формате, например 79991234567',
            )
            return
        }
        setError('')
        setIsCreatingChat(true)

        try {
            const response = await fetch(
                `${API_URL}/waInstance${idInstance}/checkAccount/${apiTokenInstance}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        phoneNumber: Number(phone),
                    }),
                },
            )

            if (!response.ok) {
                setError('Ошибка с запросом')
            }

            const data =
                (await response.json())

            if (data.status === false) {
                throw new Error(
                    data.reason ||
                    'Не удалось проверить номер',
                )
            }

            if (!data.exist || !data.chatId) {
                throw new Error(
                    'Указанный номер не зарегистрирован в MAX',
                )
            }

            setChatId(data.chatId)
            setAuthInfo({
                apiTokenInstance,
                idInstance
            })

        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Неизвестная ошибка',
            )
        } finally {
            setIsCreatingChat(false)
        }
    }

    const isSomeLoading = isAnyValueInProcess || isCreatingChat

    return (
        <section className={styles.appSection}>
            <form className={styles.formContainer}>
                <h2>Авторизация</h2>
                <AuthInput
                    headline='idInstance'
                    onSetValue={setIdInstance}
                    checkValueInProcess={setIsAnyValueInProcess}
                    placeHolder='Например: 3100000001' />
                <AuthInput
                    headline='apiTokenInstance'
                    onSetValue={setApiTokenInstance}
                    checkValueInProcess={setIsAnyValueInProcess}
                    placeHolder='API Token'
                    type='password' />
                <AuthInput
                    headline='Номер телефона получателя'
                    onSetValue={setPhone}
                    checkValueInProcess={setIsAnyValueInProcess}
                    placeHolder="79991234567" />
                <button
                    className={styles.createBtn}
                    type="button"
                    onClick={onCreateChat}
                    disabled={isSomeLoading}
                >
                    {isSomeLoading
                        ? 'Проверка'
                        : 'Создать чат'}
                </button>
                {error && (
                    <div className={styles.alertError}>
                        {error}
                    </div>
                )}
            </form>
        </section>
    )
}