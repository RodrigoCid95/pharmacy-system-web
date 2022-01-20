import React from 'react'
import Alert from './alert'
import { Product, ProductsAPI } from './../API/products/types'
import { Stack } from '@fluentui/react/lib/Stack'
import Loading from './loading'
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar'
import { DefaultButton } from '@fluentui/react/lib/Button'
import { TextField } from '@fluentui/react/lib/TextField'
import { mergeStyles } from '@fluentui/react/lib/Styling'
import { SpinButton } from '@fluentui/react/lib/SpinButton'
import { Image, ImageFit } from '@fluentui/react/lib/Image'

const notFountImage = new URL('./../descarga.jpg', import.meta.url).href

declare const products: ProductsAPI

interface ProductComponentProps {
  product?: Product
  onDismiss: () => void
}
interface ProductComponentState {
  loading: boolean
  error: string
  product: Product
}
export class ProductComponent extends React.Component<ProductComponentProps, ProductComponentState> {
  constructor(props: ProductComponentProps) {
    super(props)
    this.state = {
      loading: false,
      error: '',
      product: props.product || {
        name: '',
        description: '',
        sku: '',
        thumbnail: '',
        price: 0,
        stock: 0,
      }
    }
  }
  private async _handlerOnSave() {
    const { id, name, sku } = this.state.product
    this.setState({ error: '' })
    if (name === '') {
      this.setState({ error: 'Falta un nombre!' })
      return
    }
    if (sku === '') {
      this.setState({ error: 'Falta código SKU' })
      return
    }
    this.setState({ loading: true })
    if (id) {
      products.update(this.state.product).then(() => {
        this.setState({ loading: false })
        this.props.onDismiss()
      }).catch(error => {
        console.error(error)
        this.setState({ loading: false, error: error.message })
      })
    } else {
      products.create(this.state.product).then(() => {
        this.setState({ loading: false })
        this.props.onDismiss()
      }).catch(error => {
        console.error(error)
        this.setState({ error: error.message })
      })
    }
  }
  private _handlerOnChangeThumbnail() {
    products.selectImage(image => {
      if (this.state.product.id) {
        this.setState({ loading: true })
        products.updateThumbnail(this.state.product, image).then(thumbnail => {
          this.setState({ loading: false, product: { ...this.state.product, thumbnail } })
        })
      } else {
        this.setState({ product: { ...this.state.product, thumbnail: image } })
      }
    })
  }
  render() {
    const { onDismiss } = this.props
    const { loading, error, product } = this.state
    return (
      <Alert
        title={`${product.id ? 'Editar' : 'Nuevo'} producto`}
        onDismiss={onDismiss}
      >
        {loading && (
          <Stack styles={{ root: { marginTop: '1rem' } }}>
            <Loading label="Cargando ..." />
          </Stack>
        )}
        {!loading && (
          <React.Fragment>
            <Stack className={mergeStyles({ marginBottom: '1rem' })}>
              {error !== '' && (
                <MessageBar
                  messageBarType={MessageBarType.error}
                  onDismiss={() => this.setState({ error: '' })}
                  dismissButtonAriaLabel="Cerrar"
                >
                  {error}
                </MessageBar>
              )}
              <Image onClick={this._handlerOnChangeThumbnail.bind(this)} src={product.thumbnail || notFountImage} imageFit={ImageFit.cover} />
              <TextField defaultValue={product.name} required label="Nombre" onChange={(e: any) => this.setState({ product: { ...product, name: e.target.value } })} />
              <TextField defaultValue={product.description} label="Descripción" onChange={(e: any) => this.setState({ product: { ...product, description: e.target.value } })} multiline rows={3} />
              <TextField defaultValue={product.sku} required label="SKU" onChange={(e: any) => this.setState({ product: { ...product, sku: e.target.value } })} />
              <SpinButton defaultValue={product.price.toString()} incrementButtonAriaLabel="+" decrementButtonAriaLabel="-" min={0} step={0.1} label="Precio" onChange={(e: any) => this.setState({ product: { ...product, price: parseInt(e.target.value) } })} className={mergeStyles({ marginTop: '1rem!important' })} />
              <SpinButton defaultValue={product.stock.toString()} incrementButtonAriaLabel="+" decrementButtonAriaLabel="-" min={0} step={0.1} label="Stock" onChange={(e: any) => this.setState({ product: { ...product, stock: parseInt(e.target.value) } })} className={mergeStyles({ marginTop: '1rem!important' })} />
            </Stack>
            <Stack horizontal horizontalAlign="space-around">
              <DefaultButton
                primary
                text="Guardar"
                onClick={this._handlerOnSave.bind(this)}
              />
              <DefaultButton
                text="Cancelar"
                onClick={onDismiss}
              />
            </Stack>
          </React.Fragment>
        )}
      </Alert>
    )
  }
}