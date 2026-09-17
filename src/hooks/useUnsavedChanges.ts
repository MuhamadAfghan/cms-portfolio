import { useEffect } from 'react'

/**
 * Warns the user before leaving the page (refresh / tab close / browser back)
 * while a form has unsaved changes. In-app navigation is guarded separately by
 * confirming on the Cancel button, since this app uses a non-data <BrowserRouter>
 * where useBlocker is unavailable.
 */
export const useUnsavedChanges = (isDirty: boolean) => {
  useEffect(() => {
    if (!isDirty) return

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      // Required for some browsers to trigger the native confirmation prompt.
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])
}
