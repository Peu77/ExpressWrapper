import {DependencyOption, DependencyOptionResponse} from "./Controller";

/**
 * dependency to check if value is greater or equal than minLength
 * @param minLength
 */
function getMinLengthOption(minLength: number): DependencyOption<string> {
    return (value: string): DependencyOptionResponse => {
        const success: boolean = value.length >= minLength
        return {
            success: success,
            message: !success ? `value's length (${value}) must be greater or equal than ${minLength}` : ""
        }
    }
}

/**
 * dependency to check if value's length is less or equal than maxLength
 * @param maxLength
 */
function getMaxLengthOption(maxLength: number): DependencyOption<string> {
    return (value: string): DependencyOptionResponse => {
        const success: boolean = value.length <= maxLength
        return {
            success: success,
            message: !success ? `value's length (${value}) must be less or equal than ${maxLength}` : ""
        }
    }
}

/**
 * dependency to check if value is an email
 * @param value
 */
const isEmailOption: DependencyOption<string> = (value: string) => {
    const success: boolean = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    return {
        success: success,
        message: !success ? `the value ${value} is not an email` : ""
    }
}

export const DependencyOptions = {
    getMinLengthOption,
    getMaxLengthOption,
    isEmailOption
}