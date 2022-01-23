import React from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import { mergeStyles } from '@fluentui/react/lib/Styling'
import { IStackTokens, Stack } from '@fluentui/react/lib/Stack'
import { Text } from '@fluentui/react/lib/Text'
import { ActionButton, IconButton, PrimaryButton } from '@fluentui/react/lib/Button'
import { Panel, PanelType } from '@fluentui/react/lib/Panel'
import { useBoolean } from '@fluentui/react-hooks'
import Loading from './components/loading'
import './API'

const stackTokens: IStackTokens = { childrenGap: 15 }

mergeStyles({
  ':global(body,html,#root)': {
    margin: 0,
    padding: 0,
    boxSazing: 'border-box',
    height: '100%',
  },
  ':global(#root)': {
    height: '95%',
  },
})

const IndexPage = React.lazy(() => import('./pages/index'))
const UsersPage = React.lazy(() => import('./pages/users'))
const ProductsPage = React.lazy(() => import('./pages/products'))

const Menu: React.FC<{ isOpen: boolean; dismissPanel: () => void; onChangeTitle: (title: string) => void; }> = ({ isOpen, dismissPanel, onChangeTitle }) => {
  const navigate = useNavigate()
  const onRenderFooterContent = React.useCallback(
    () => (
      <div>
        <PrimaryButton onClick={() => navigate('/')} styles={{ root: { marginRight: 8 } }}>
          Cerrar sesión
        </PrimaryButton>
      </div>
    ),
    [navigate],
  )
  return (
    <Panel
      isLightDismiss
      isOpen={isOpen}
      onDismiss={dismissPanel}
      type={PanelType.smallFixedNear}
      closeButtonAriaLabel="Cerrar"
      headerText="Menú"
      onRenderFooterContent={onRenderFooterContent}
      isFooterAtBottom
    >
      <Stack className={mergeStyles({ marginTop: '1rem' })}>
        <ActionButton
          iconProps={{ iconName: 'People' }}
          onClick={() => {
            navigate('/admin/users')
            dismissPanel()
            onChangeTitle('Usuarios')
          }}
        >
          Usuarios
        </ActionButton>
        <ActionButton
          iconProps={{ iconName: 'ProductList' }}
          onClick={() => {
            navigate('/admin/products')
            dismissPanel()
            onChangeTitle('Productos')
          }}
        >
          Productos
        </ActionButton>
      </Stack>
    </Panel>
  )
}

const AdminDashboard: React.FC = () => {
  const [isOpenMenu, { setTrue: openMenu, setFalse: dismissMenu }] = useBoolean(false)
  const [title, setTitle] = React.useState('')
  return (
    <Stack
      className={mergeStyles({
        width: '100%',
        height: '100%',
        color: '#605e5c',
        padding: '1rem'
      })}
      tokens={stackTokens}
    >
      <Stack horizontal>
        <IconButton iconProps={{ iconName: 'CollapseMenu' }} title="Menú" ariaLabel="Menú" onClick={openMenu} />
        <Text variant="xLarge">Administrador{title === '' ? '' : ` - ${title}`}</Text>
      </Stack>
      <Stack className={mergeStyles({ height: '100%' })}>
        <Menu
          isOpen={isOpenMenu}
          dismissPanel={dismissMenu}
          onChangeTitle={setTitle}
        />
        <Routes>
          <Route path="/" element={
            <React.Suspense fallback={<Loading />}>
              <IndexPage />
            </React.Suspense>
          } />
          <Route path="/users" element={
            <React.Suspense fallback={<Loading />}>
              <UsersPage />
            </React.Suspense>
          } />
          <Route path="/products" element={
            <React.Suspense fallback={<Loading />}>
              <ProductsPage />
            </React.Suspense>
          } />
        </Routes>
      </Stack>
    </Stack>
  )
}

export default AdminDashboard