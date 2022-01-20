import * as React from 'react'
import { useNavigate } from "react-router-dom"
import { IStackTokens, Stack } from '@fluentui/react/lib/Stack'
import { TextField } from '@fluentui/react/lib/TextField'
import { DefaultButton } from '@fluentui/react/lib/Button'
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar'
import { Auth } from './API/types'
import './API'

declare const auth: Auth

const stackTokens: IStackTokens = { childrenGap: 15 }
const SignIn: React.FC<{ label?: string }> = () => {
  const navigate = useNavigate()
  const [userName, setUserName] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  return (
    <Stack horizontalAlign="center" verticalAlign="center" verticalFill styles={{ root: { width: '80%', margin: '0 auto', textAlign: 'center', color: '#605e5c' } }} tokens={stackTokens}>
      <Stack>
        {error !== '' && (
          <MessageBar
            messageBarType={MessageBarType.error}
            onDismiss={() => setError('')}
            dismissButtonAriaLabel="Close"
          >
            {error}
          </MessageBar>
        )}
        <TextField
          label="Nombre de usuario:"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: any) => setUserName(e.target.value)}
        />
        <TextField
          label="Contraseña:"
          type="password"
          canRevealPassword
          revealPasswordAriaLabel="Show password"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: any) => setPassword(e.target.value)}
        />
      </Stack>
      <DefaultButton
        primary
        styles={{ root: { justifyContent: 'center' } }}
        text="Entrar"
        onClick={async () => {
          setError('')
          if (userName === '') {
            setError('Escribe un nombre de usuario!')
          } else if (password === '') {
            setError('Escribe una contraseña!')
          } else {
            auth.enter(userName, password, false).then(() => {
              navigate('/app')
            }).catch((error: Error) => {
              console.error(error)
              setError(error.message)
            })
          }
        }}
        split
        menuProps={{
          items: [
            {
              key: 'enterAsAdmin',
              text: 'Entrar como administrador',
              iconProps: { iconName: 'Admin' },
              onClick: () => {
                setError('')
                if (userName === '') {
                  setError('Escribe un nombre de usuario!')
                } else if (password === '') {
                  setError('Escribe una contraseña!')
                } else {
                  auth.enter(userName, password, true).then(() => {
                    navigate('/admin')
                  }).catch((error: Error) => {
                    console.error(error)
                    setError(error.message)
                  })
                }
              }
            }
          ]
        }}
      />
    </Stack>
  )
}
export default SignIn