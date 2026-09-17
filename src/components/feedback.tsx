import { useCallback, useRef, useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
} from '@mui/material'

/* ------------------------------------------------------------------ */
/* Confirm dialog — replaces window.confirm with a promise-based API. */
/* ------------------------------------------------------------------ */

interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  destructive?: boolean
}

export const useConfirm = () => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const resolver = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const close = useCallback((result: boolean) => {
    resolver.current?.(result)
    resolver.current = null
    setOptions(null)
  }, [])

  const dialog = (
    <Dialog open={Boolean(options)} onClose={() => close(false)} maxWidth="xs" fullWidth>
      <DialogTitle>{options?.title ?? 'Confirm'}</DialogTitle>
      <DialogContent>
        <DialogContentText>{options?.message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => close(false)}>{options?.cancelText ?? 'Cancel'}</Button>
        <Button
          variant="contained"
          color={options?.destructive ? 'error' : 'primary'}
          onClick={() => close(true)}
          autoFocus
        >
          {options?.confirmText ?? 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  )

  return { confirm, confirmDialog: dialog }
}

/* ------------------------------------------------------------------ */
/* Notify — replaces window.alert with a Snackbar + Alert.            */
/* ------------------------------------------------------------------ */

type Severity = 'error' | 'success' | 'info' | 'warning'

interface NotifyState {
  message: string
  severity: Severity
}

export const useNotify = () => {
  const [state, setState] = useState<NotifyState | null>(null)

  const notify = useCallback((message: string, severity: Severity = 'info') => {
    setState({ message, severity })
  }, [])

  const notifyError = useCallback((message: string) => setState({ message, severity: 'error' }), [])

  const snackbar = (
    <Snackbar
      open={Boolean(state)}
      autoHideDuration={5000}
      onClose={() => setState(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      {state ? (
        <Alert severity={state.severity} onClose={() => setState(null)} variant="filled">
          {state.message}
        </Alert>
      ) : undefined}
    </Snackbar>
  )

  return { notify, notifyError, snackbar }
}
