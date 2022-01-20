import React from 'react'
import { DetailsList, DetailsListLayoutMode, Selection, IColumn } from '@fluentui/react/lib/DetailsList'
import { CommandBar } from '@fluentui/react/lib/CommandBar'
import { Stack } from '@fluentui/react/lib/Stack'
import { TextField } from '@fluentui/react/lib/TextField'
import { MarqueeSelection } from '@fluentui/react/lib/MarqueeSelection'
import { mergeStyles } from '@fluentui/react/lib/Styling'
import { Image, ImageFit } from '@fluentui/react/lib/Image'
import { ProductsAPI, Product } from './../API/products/types'
import Loading from './../components/loading'
import { ProductComponent } from '../components/product'
import Confirm from './../components/confirm'

declare const products: ProductsAPI
const notFountImage = new URL('./../descarga.jpg', import.meta.url).href

interface ProductsPageState {
  sortedItems: Product[]
  columns: IColumn[]
  loading: string
  currentProduct: Product | undefined
  openProductModal: boolean
  openDeleteAlert: boolean
}
export default class ProductsPage extends React.Component<{}, ProductsPageState> {
  private _selection: Selection
  private _allItems: Product[]
  constructor(props: {}) {
    super(props)
    this._selection = new Selection()
    this._allItems = []
    this.state = {
      sortedItems: this._allItems,
      columns: [
        { key: 'thumbnail', name: 'Imágen', fieldName: 'thumbnail', minWidth: 100, maxWidth: 100, isResizable: false },
        { key: 'name', name: 'Nombre', fieldName: 'name', minWidth: 100, maxWidth: 200, isResizable: true },
        { key: 'description', name: 'Descripción', fieldName: 'description', minWidth: 100, maxWidth: 200, isResizable: true },
        { key: 'sku', name: 'SKU', fieldName: 'sku', minWidth: 100, maxWidth: 200, isResizable: true },
        { key: 'price', name: 'Precio', fieldName: 'price', minWidth: 100, maxWidth: 200, isResizable: true },
        { key: 'stock', name: 'Stock', fieldName: 'stock', minWidth: 100, maxWidth: 200, isResizable: true },
      ],
      loading: '',
      currentProduct: undefined,
      openProductModal: false,
      openDeleteAlert: false
    }
  }
  async componentDidMount() {
    await this.loadProducts()
  }
  private async loadProducts() {
    this.setState({ loading: 'Cargando lista de productos ...' })
    const items = await products.read()
    this._allItems = items
    this.setState({
      sortedItems: items,
      loading: ''
    })
  }
  private _onFilter = (text: string): void => {
    this.setState({
      sortedItems: text ? this._allItems.filter(i => i.name.toLowerCase().indexOf(text) > -1) : this._allItems,
    });
  }
  private _onItemInvoked = (item: Product): void => {
    this.setState({ openProductModal: true, currentProduct: item })
  }
  private _onColumnClick = (_event: React.MouseEvent<HTMLElement, MouseEvent> | undefined, column?: IColumn): void => {
    if (column && column.key !== 'thumbnail') {
      const { columns } = this.state
      let { sortedItems } = this.state
      let isSortedDescending = column.isSortedDescending
      if (column.isSorted) {
        isSortedDescending = !isSortedDescending
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      sortedItems = _copyAndSort(sortedItems, column.fieldName!, isSortedDescending)
      this.setState({
        sortedItems: sortedItems,
        columns: columns.map(col => {
          col.isSorted = col.key === column.key;

          if (col.isSorted) {
            col.isSortedDescending = isSortedDescending;
          }

          return col;
        }),
      })
    }
  }
  private async _handlerOnDelete() {
    this.setState({ openDeleteAlert: false, loading: `Eliminando ${this._selection.getSelectedCount() === 0 ? 'producto' : 'productos'}` })
    const productsList = (this._selection.getSelection() as Product[])
    for (const product of productsList) {
      await products.delete(product)
    }
    await this.loadProducts()
  }
  render() {
    const { columns, sortedItems, loading, currentProduct, openProductModal, openDeleteAlert } = this.state
    return (
      <React.Fragment>
        <Stack className={mergeStyles({ flexDirection: 'row', alignItems: 'center' })}>
          <TextField
            placeholder="Filtrar por nombre"
            onChange={(_e, t) => this._onFilter(t || '')}
          />
          <CommandBar
            className={mergeStyles({ minWidth: '210px' })}
            items={[
              {
                key: 'new',
                text: 'Nuevo',
                iconProps: { iconName: 'Add' },
                onClick: () => this.setState({ currentProduct: undefined, openProductModal: true })
              },
              {
                key: 'delete',
                text: 'Eliminar',
                iconProps: { iconName: 'Remove' },
                onClick: () => this.setState({ openDeleteAlert: true })
              }
            ]}
          />
        </Stack>
        <Stack className={mergeStyles({ overflow: 'auto', height: '100%' })}>
          {loading !== '' && <Loading label={loading} />}
          {!loading && (
            <MarqueeSelection selection={this._selection}>
              <DetailsList
                items={sortedItems}
                columns={columns}
                onRenderItemColumn={_renderItemColumn}
                onColumnHeaderClick={this._onColumnClick}
                setKey="set"
                layoutMode={DetailsListLayoutMode.justified}
                selection={this._selection}
                selectionPreservedOnEmptyClick={true}
                onItemInvoked={this._onItemInvoked}
              />
            </MarqueeSelection>
          )}
        </Stack>
        {openProductModal && (
          <ProductComponent
            onDismiss={() => {
              this.setState({ openProductModal: false, currentProduct: undefined })
              this.loadProducts()
            }}
            product={currentProduct}
          />
        )}
        {openDeleteAlert && (
          <Confirm
            title="Eliminar"
            text={this._selection.getSelectedCount() === 0 ? 'Primero selecciona uno o más productos' : this._selection.getSelectedCount() === 1 ? '¿Estás segur@ que quieres borrar este producto?' : '¿Estás segur@ que quieres borrar estos productos?'}
            textYes={this._selection.getSelectedCount() === 0 ? '' : 'Borrar'}
            onCancel={() => this.setState({ openDeleteAlert: false })}
            onNo={() => this.setState({ openDeleteAlert: false })}
            onYes={this._handlerOnDelete.bind(this)}
          />
        )}
      </React.Fragment>
    )
  }
}
function _renderItemColumn(item: Product, index?: number | undefined, column?: IColumn | undefined) {
  if (column) {
    const fieldContent = item[column.fieldName as keyof Product] as string;
    if (column.key === 'thumbnail') {
      return <Image src={fieldContent || notFountImage} width={50} height={50} imageFit={ImageFit.cover} />
    } else if (column.key === 'price') {
      return <span>${fieldContent}</span>
    } else {
      return <span>{fieldContent}</span>
    }
  }
}
function _copyAndSort<T>(items: T[], columnKey: string, isSortedDescending?: boolean): T[] {
  const key = columnKey as keyof T;
  return items.slice(0).sort((a: T, b: T) => ((isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1));
}