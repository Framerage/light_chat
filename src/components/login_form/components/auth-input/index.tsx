import { useEffect, useState, type FC } from "react"
import { useDebounce } from "../../../../hooks/use-debounce"
import styles from './index.module.scss'

interface IProps {
    onSetValue: (v: string) => void
    checkValueInProcess: (v: boolean) => void
    placeHolder?: string
    type?: React.InputHTMLAttributes<HTMLInputElement>['type']
    headline: string
}
export const AuthInput: FC<IProps> = ({ onSetValue, placeHolder, checkValueInProcess, type, headline }) => {
    const [value, setValue] = useState<string>('')

    const { debouncedValue, isValueLoading } = useDebounce(value, 500)

    useEffect(() => {
        checkValueInProcess(isValueLoading)
        if (!isValueLoading) {
            onSetValue(debouncedValue)
        }
    }, [debouncedValue, isValueLoading])

    return (
        <label className={styles.inputContainer}>
            <h3>{headline}</h3>
            <input
                type={type}
                className={styles.appInputField}
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder={placeHolder}
            />
        </label>
    )
}