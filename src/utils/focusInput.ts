import { useFocus } from '@vueuse/core'

export const focusInput = (inputId: string | undefined): void => {
  // used the id to target the input element
  if (inputId) {
    const inputElement = document.getElementById(inputId)
    // focus that element
    useFocus(inputElement as HTMLInputElement, { initialValue: true })
  }
}
