import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useMovements } from '../../src/hooks/useMovements'

vi.mock('../../src/services/movementService', () => ({
  subscribeToMovements: vi.fn(),
}))

import { subscribeToMovements } from '../../src/services/movementService'

describe('useMovements', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('llama unsubscribe al desmontar el componente', async () => {
    // Arrange
    const unsubscribe = vi.fn()
    subscribeToMovements.mockImplementation((_uid, onData) => {
      onData([])
      return unsubscribe
    })

    // Act
    const { unmount } = renderHook(() => useMovements('user-1'))

    await waitFor(() => {
      expect(subscribeToMovements).toHaveBeenCalledWith(
        'user-1',
        expect.any(Function),
        expect.any(Function),
      )
    })

    unmount()

    // Assert
    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })
})
