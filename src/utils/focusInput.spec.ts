import { focusInput } from '@/utils/focusInput'

describe('focusInput', () => {
  it('should focus the input element with the given id', () => {
    const mockInputElement = document.createElement('input')
    mockInputElement.id = 'test-input'

    document.body.appendChild(mockInputElement)

    const inputId = mockInputElement.id

    focusInput(inputId)

    expect(document.activeElement).toBe(mockInputElement)
    // clean up
    document.body.removeChild(mockInputElement)
  })
})
