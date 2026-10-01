import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

import {
  getInventoryMovements,
} from '../services/inventoryMovementService'

import {
  DEFAULT_FEE_TABLE,
} from '../constants'

import {
  getSuppliers,
  createSupplier,
  updateSupplier as updateSupplierService,
  deleteSupplier as deleteSupplierService,
} from '../services/supplierService'

import {
  getProducts,
  createProduct,
  updateProduct as updateProductService,
  deactivateProduct,
} from '../services/productService'

import {
  getExpenses,
  createExpense,
} from '../services/expenseService'

import {
  getSales,
} from '../services/saleService'

import {
  getFinancialBalances,
  setOpeningBalances,
} from '../services/financialLedgerService'

import {
  getCashVaultTransactions,
  createCashVaultTransaction,
} from '../services/cashVaultService'

import {
  createGcashTransaction,
  getGcashTransactions,
} from '../services/gcashService'

import {
  createLoadTransaction,
  getLoadTransactions,
} from '../services/loadService'

import {
  getCustomers,
  deleteCustomer,
  getUtangEntries,
  createUtangEntry,
  getUtangPayments,
  createUtangPayment,
} from '../services/utangService'

import {
  updateStoreSettings,
} from '../services/storeService'


const uid = () =>
  Date.now() +
  Math.floor(Math.random() * 1000)


export const useStore = create(
  persist(
    (set, get) => ({

      // =========================================================
      // STORE
      // =========================================================

      storeId: null,

      storeName: 'Tindahan',

      ownerName: null,

      storeRole: null,


      /*
       * Clear all store-specific data.
       *
       * This is important when another user signs in.
       * We do NOT want Store A's in-memory data to remain
       * visible while Store B is being loaded.
       */

      clearStoreData: () => {
        set({
          storeId: null,

          storeName: 'Tindahan',

          ownerName: null,

          storeRole: null,

          products: [],

          sales: [],

          loadTxns: [],

          gcashTxns: [],

          expenses: [],

          suppliers: [],

          stockHistory: [],

          customers: [],

          utangEntries: [],

          utangPayments: [],

          cash: 0,

          gcashBalance: 0,

          smartLoadBalance: 0,

          globeLoadBalance: 0,

          cashVault: 0,

          vaultHistory: [],
        })
      },


      /*
       * Set the active authenticated user's store.
       *
       * If the store changes, clear the old store's data first.
       */

      setStore: (store) => {
        const previousStoreId =
          get().storeId

        const nextStoreId =
          store?.storeId || null

        /*
         * If there is no authenticated store,
         * completely clear store data.
         */

        if (!store || !nextStoreId) {
          set({
            storeId: null,

            storeName: 'Tindahan',

            ownerName: null,

            storeRole: null,

            products: [],

            sales: [],

            loadTxns: [],

            gcashTxns: [],

            expenses: [],

            suppliers: [],

            stockHistory: [],

            customers: [],

            utangEntries: [],

            utangPayments: [],

            cash: 0,

            gcashBalance: 0,

            smartLoadBalance: 0,

            globeLoadBalance: 0,

            cashVault: 0,

            vaultHistory: [],
          })

          return
        }

        /*
         * If a different store is being loaded,
         * clear the previous store's data.
         */

        if (
          previousStoreId &&
          previousStoreId !== nextStoreId
        ) {
          set({
            products: [],

            sales: [],

            loadTxns: [],

            gcashTxns: [],

            expenses: [],

            suppliers: [],

            stockHistory: [],

            customers: [],

            utangEntries: [],

            utangPayments: [],

            cash: 0,

            gcashBalance: 0,

            smartLoadBalance: 0,

            globeLoadBalance: 0,

            cashVault: 0,

            vaultHistory: [],
          })
        }

        set({
          storeId: nextStoreId,

          storeName:
            store?.store_name ||
            'Tindahan',

          ownerName:
            store?.ownerName ||
            null,

          storeRole:
            store?.role ||
            null,
        })
      },


      // =========================================================
      // LOAD ALL DATA FOR ACTIVE STORE
      // =========================================================

      loadAllStoreData: async (
        suppliedStoreId
      ) => {
        /*
         * Prefer the explicitly supplied store ID,
         * but fall back to Zustand's active store.
         */

        const storeId =
          suppliedStoreId ||
          get().storeId

        if (!storeId) {
          throw new Error(
            'Store ID is required'
          )
        }

        /*
         * Safety check:
         *
         * If a store ID was supplied, make sure it is
         * the currently active store before loading.
         */

        if (
          get().storeId &&
          get().storeId !== storeId
        ) {
          console.warn(
            'Store ID changed while loading data. Updating active store.'
          )

          set({
            storeId,
          })
        }

        console.log(
          'STORE DATA: Loading all data for store:',
          storeId
        )

        try {
          /*
           * Every function below receives the SAME store ID.
           *
           * This prevents data from another store from being
           * loaded into the current account.
           */

          await Promise.all([
            get().loadProducts(storeId),

            get().loadSales(storeId),

            get().loadStockHistory(storeId),

            get().loadFinancialBalances(
              storeId
            ),

            get().loadGcashTransactions(
              storeId
            ),

            get().loadLoadTransactions(
              storeId
            ),

            get().loadExpenses(storeId),

            get().loadSuppliers(storeId),

            get().loadUtangData(storeId),

            get().loadVaultHistory(storeId),
          ])

          console.log(
            'STORE DATA: All data loaded successfully.',
            {
              storeId,

              products:
                get().products.length,

              sales:
                get().sales.length,

              stockHistory:
                get().stockHistory.length,

              expenses:
                get().expenses.length,

              suppliers:
                get().suppliers.length,

              gcashTransactions:
                get().gcashTxns.length,

              loadTransactions:
                get().loadTxns.length,

              customers:
                get().customers.length,

              utangEntries:
                get().utangEntries.length,

              utangPayments:
                get().utangPayments.length,

              vaultHistory:
                get().vaultHistory.length,
            }
          )

          return true
        } catch (error) {
          console.error(
            'STORE DATA: Failed to load store data:',
            error
          )

          throw error
        }
      },


      // =========================================================
      // STORE SETTINGS
      // =========================================================

      setStoreSettings: async (data) => {
        const state = get()

        if (!state.storeId) {
          throw new Error(
            'Store ID is required'
          )
        }

        const updated =
          await updateStoreSettings({
            storeId: state.storeId,

            storeName:
              data.storeName,

            ownerName:
              data.ownerName,
          })

        set({
          storeName:
            updated.storeName ||
            'Tindahan',

          ownerName:
            updated.ownerName ||
            'Boss',
        })

        return updated
      },


      // =========================================================
      // UTANG
      // =========================================================

      loadUtangData: async (storeId) => {
        if (!storeId) {
          throw new Error(
            'Store ID is required'
          )
        }

        const [
          customers,
          utangEntries,
          utangPayments,
        ] = await Promise.all([
          getCustomers(storeId),

          getUtangEntries(storeId),

          getUtangPayments(storeId),
        ])

        set({
          customers,

          utangEntries,

          utangPayments,
        })

        return {
          customers,

          utangEntries,

          utangPayments,
        }
      },


      addUtang: async ({
        customerId,
        customerName,
        item,
        amount,
        date,
        dueDate,
      }) => {
        const storeId =
          get().storeId

        if (!storeId) {
          throw new Error(
            'Store ID is required'
          )
        }

        await createUtangEntry({
          storeId,

          customerId,

          customerName,

          item,

          amount,

          date,

          dueDate,
        })

        await get().loadUtangData(
          storeId
        )
      },


      logUtangPayment: async ({
        customerId,
        amount,
        paymentMethod,
        date,
        note,
      }) => {
        const storeId =
          get().storeId

        if (!storeId) {
          throw new Error(
            'Store ID is required'
          )
        }

        await createUtangPayment({
          storeId,

          customerId,

          amount,

          paymentMethod,

          date,

          note,
        })

        await Promise.all([
          get().loadUtangData(
            storeId
          ),

          get().loadFinancialBalances(
            storeId
          ),
        ])
      },


      deleteCustomer: async (
        customerId
      ) => {
        const storeId =
          get().storeId

        if (!storeId) {
          throw new Error(
            'Store ID is required'
          )
        }

        await deleteCustomer(
          storeId,
          customerId
        )

        await get().loadUtangData(
          storeId
        )
      },


      // =========================================================
      // LOAD TRANSACTIONS
      // =========================================================

      loadLoadTransactions:
        async (storeId) => {
          if (!storeId) {
            throw new Error(
              'Store ID is required'
            )
          }

          try {
            const data =
              await getLoadTransactions(
                storeId
              )

            const transactions =
              data.map(
                (transaction) => ({
                  id:
                    transaction.id,

                  ts:
                    transaction.created_at,

                  type:
                    transaction.transaction_type,

                  phone:
                    transaction.phone ||
                    '',

                  network:
                    transaction.network ||
                    '',

                  amount:
                    Number(
                      transaction.amount
                    ) || 0,

                  fee:
                    Number(
                      transaction.service_fee
                    ) || 0,

                  feePaidVia:
                    transaction.fee_paid_via ||
                    'Cash',

                  customerName:
                    transaction.customer_name ||
                    '',

                  ref:
                    transaction.reference_number ||
                    '',

                  price:
                    transaction.sell_price ===
                    null
                      ? undefined
                      : Number(
                          transaction.sell_price
                        ),

                  profit:
                    Number(
                      transaction.profit
                    ) || 0,

                  status:
                    transaction.status,

                  storeId:
                    transaction.store_id,
                })
              )

            set({
              loadTxns:
                transactions,
            })

            console.log(
              `Loaded ${transactions.length} Load transactions from Supabase`
            )

            return transactions
          } catch (error) {
            console.error(
              'Failed to load Load transactions:',
              error
            )

            throw error
          }
        },


      // =========================================================
      // GCASH TRANSACTIONS
      // =========================================================

      loadGcashTransactions:
        async (storeId) => {
          if (!storeId) {
            throw new Error(
              'Store ID is required'
            )
          }

          try {
            const data =
              await getGcashTransactions(
                storeId
              )

            const transactions =
              data.map(
                (transaction) => ({
                  id:
                    transaction.id,

                  ts:
                    transaction.created_at,

                  type:
                    transaction.transaction_type ===
                    'CASH_IN'
                      ? 'Cash-In'
                      : transaction.transaction_type ===
                          'CASH_OUT'
                        ? 'Cash-Out'
                        : transaction.transaction_type,

                  customerName:
                    transaction.customer_name ||
                    '',

                  amount:
                    Number(
                      transaction.amount
                    ) || 0,

                  fee:
                    Number(
                      transaction.service_fee
                    ) || 0,

                  feePaidVia:
                    transaction.fee_paid_via ||
                    'Cash',

                  ref:
                    transaction.reference_number ||
                    '',

                  status:
                    transaction.status,

                  storeId:
                    transaction.store_id,
                })
              )

            set({
              gcashTxns:
                transactions,
            })

            console.log(
              `Loaded ${transactions.length} GCash transactions from Supabase`
            )

            return transactions
          } catch (error) {
            console.error(
              'Failed to load GCash transactions:',
              error
            )

            throw error
          }
        },


      // =========================================================
      // CASH VAULT
      // =========================================================

      loadVaultHistory:
        async (storeId) => {
          if (!storeId) {
            throw new Error(
              'Store ID is required'
            )
          }

          try {
            const history =
              await getCashVaultTransactions(
                storeId
              )

            const vaultHistory =
              history.map(
                (item) => ({
                  id: item.id,

                  ts:
                    item.created_at,

                  type:
                    item.transaction_type ===
                    'DEPOSIT'
                      ? 'Deposit'
                      : 'Withdraw',

                  amount:
                    Number(item.amount) ||
                    0,

                  note:
                    item.note || '',

                  storeId:
                    item.store_id,

                  createdBy:
                    item.created_by,
                })
              )

            set({
              vaultHistory,
            })

            return vaultHistory
          } catch (error) {
            console.error(
              'Failed to load cash vault history:',
              error
            )

            throw error
          }
        },


      // =========================================================
      // FINANCIAL BALANCES
      // =========================================================

      loadFinancialBalances:
        async (storeId) => {
          if (!storeId) {
            throw new Error(
              'Store ID is required'
            )
          }

          try {
            const balances =
              await getFinancialBalances(
                storeId
              )

            set({
              cash:
                balances.cash,

              gcashBalance:
                balances.gcash,

              smartLoadBalance:
                balances.smartLoad,

              globeLoadBalance:
                balances.globeLoad,

              cashVault:
                balances.cashVault,
            })

            return balances
          } catch (error) {
            console.error(
              'Failed to load financial balances:',
              error
            )

            throw error
          }
        },


      // =========================================================
      // SUPPLIERS
      // =========================================================

      loadSuppliers:
        async (storeId) => {
          if (!storeId) {
            throw new Error(
              'Store ID is required'
            )
          }

          try {
            const data =
              await getSuppliers(
                storeId
              )

            const suppliers =
              data.map(
                (supplier) => ({
                  id:
                    supplier.id,

                  name:
                    supplier.name,

                  contactNumber:
                    supplier.contact_number ||
                    '',

                  address:
                    supplier.address ||
                    '',

                  balance: 0,

                  purchases: [],

                  storeId:
                    supplier.store_id,
                })
              )

            set({
              suppliers,
            })

            console.log(
              `Loaded ${suppliers.length} suppliers from Supabase`
            )

            return suppliers
          } catch (error) {
            console.error(
              'Failed to load suppliers:',
              error
            )

            throw error
          }
        },


      // =========================================================
      // SALES
      // =========================================================

      loadSales:
        async (storeId) => {
          if (!storeId) {
            throw new Error(
              'Store ID is required'
            )
          }

          try {
            const sales =
              await getSales(
                storeId
              )

            set({
              sales,
            })

            return sales
          } catch (error) {
            console.error(
              'Failed to load sales:',
              error
            )

            throw error
          }
        },


      // =========================================================
      // STOCK HISTORY
      // =========================================================

      loadStockHistory:
        async (storeId) => {
          if (!storeId) {
            throw new Error(
              'Store ID is required'
            )
          }

          try {
            const data =
              await getInventoryMovements(
                storeId
              )

            const stockHistory =
              data.map(
                (movement) => ({
                  id:
                    movement.id,

                  ts:
                    movement.created_at,

                  product:
                    movement.products?.name ||
                    'Unknown Product',

                  added:
                    Number(
                      movement.quantity_change
                    ) > 0
                      ? Number(
                          movement.quantity_change
                        )
                      : 0,

                  removed:
                    Number(
                      movement.quantity_change
                    ) < 0
                      ? Math.abs(
                          Number(
                            movement.quantity_change
                          )
                        )
                      : 0,

                  reason:
                    movement.movement_type ===
                    'STOCK_IN'
                      ? 'Stock-In'
                      : movement.movement_type ===
                          'INITIAL_STOCK'
                        ? 'Initial Stock'
                        : movement.movement_type ===
                            'SALE'
                          ? 'Sale'
                          : movement.movement_type ===
                              'RETURN'
                            ? 'Return'
                            : movement.movement_type ===
                                'VOID'
                              ? 'Void'
                              : movement.movement_type ===
                                  'ADJUSTMENT'
                                ? 'Adjustment'
                                : movement.movement_type ===
                                    'DAMAGE'
                                  ? 'Damage'
                                  : movement.movement_type ===
                                      'EXPIRY'
                                    ? 'Expiry'
                                    : movement.movement_type,

                  supplier:
                    movement.suppliers?.name ||
                    '',

                  ref:
                    movement.reference_number ||
                    '',

                  notes:
                    movement.notes ||
                    '',

                  remaining:
                    Number(
                      movement.new_quantity
                    ),
                })
              )

            set({
              stockHistory,
            })

            console.log(
              `Loaded ${stockHistory.length} inventory movements from Supabase`
            )

            return stockHistory
          } catch (error) {
            console.error(
              'Failed to load stock history:',
              error
            )

            throw error
          }
        },


      // =========================================================
      // PRODUCTS
      // =========================================================

      products: [],


      loadProducts:
        async (storeId) => {
          if (!storeId) {
            console.warn(
              'Cannot load products: storeId is missing'
            )

            return
          }

          try {
            const data =
              await getProducts(
                storeId
              )

            const products =
              data.map(
                (product) => ({
                  id:
                    product.id,

                  name:
                    product.name,

                  category:
                    product.category_id,

                  price:
                    Number(
                      product.selling_price
                    ) || 0,

                  cost:
                    Number(
                      product.cost_price
                    ) || 0,

                  stock:
                    Number(
                      product.stock_quantity
                    ) || 0,

                  status:
                    product.is_active
                      ? 'active'
                      : 'inactive',

                  unit:
                    product.unit,

                  sku:
                    product.sku,

                  barcode:
                    product.barcode,

                  wholesalePrice:
                    product.wholesale_price ===
                      null ||
                    product.wholesale_price ===
                      undefined
                      ? null
                      : Number(
                          product.wholesale_price
                        ),

                  minimumStock:
                    Number(
                      product.minimum_stock
                    ) || 0,

                  supplierId:
                    product.supplier_id ||
                    null,

                  expirationDate:
                    product.expiration_date ||
                    null,

                  isBulk:
                    Boolean(
                      product.is_bulk
                    ),

                  storeId:
                    product.store_id,
                })
              )

            /*
             * Extra safety check:
             *
             * Never allow a product from another store
             * into the current Zustand state.
             */

            const storeProducts =
              products.filter(
                (product) =>
                  product.storeId ===
                  storeId
              )

            set({
              products:
                storeProducts,
            })

            console.log(
              `Loaded ${storeProducts.length} products from Supabase for store ${storeId}`
            )

            return storeProducts
          } catch (error) {
            console.error(
              'Failed to load products from Supabase:',
              error
            )

            throw error
          }
        },


      // =========================================================
      // ADD PRODUCT
      // =========================================================

      addProduct:
        async (data) => {
          const storeId =
            get().storeId

          if (!storeId) {
            throw new Error(
              'Cannot create product: storeId is missing'
            )
          }

          const productToCreate = {
            store_id:
              storeId,

            name:
              data.name,

            category_id:
              data.categoryId ??
              data.category_id ??
              data.category ??
              null,

            selling_price:
              Number(
                data.price ??
                data.sellingPrice ??
                data.selling_price
              ) || 0,

            cost_price:
              Number(
                data.cost ??
                data.costPrice ??
                data.cost_price
              ) || 0,

            stock_quantity:
              Number(
                data.stock ??
                data.stockQuantity ??
                data.stock_quantity
              ) || 0,

            unit:
              data.unit ||
              'piece',

            sku:
              data.sku ||
              null,

            barcode:
              data.barcode ||
              null,

            wholesale_price:
              data.wholesalePrice ===
                '' ||
              data.wholesalePrice ===
                undefined ||
              data.wholesalePrice ===
                null
                ? null
                : Number(
                    data.wholesalePrice
                  ),

            minimum_stock:
              Number(
                data.minimumStock ??
                data.minimum_stock
              ) || 0,

            supplier_id:
              data.supplierId ??
              data.supplier_id ??
              null,

            expiration_date:
              data.expirationDate ??
              data.expiration_date ??
              null,

            is_bulk:
              Boolean(
                data.isBulk ??
                data.is_bulk
              ),

            is_active:
              true,
          }

          try {
            const createdProduct =
              await createProduct(
                productToCreate
              )

            /*
             * Safety check.
             */

            if (
              createdProduct.store_id !==
              storeId
            ) {
              throw new Error(
                'Created product belongs to a different store.'
              )
            }

            const product = {
              id:
                createdProduct.id,

              name:
                createdProduct.name,

              category:
                createdProduct.category_id,

              price:
                Number(
                  createdProduct.selling_price
                ) || 0,

              cost:
                Number(
                  createdProduct.cost_price
                ) || 0,

              stock:
                Number(
                  createdProduct.stock_quantity
                ) || 0,

              status:
                createdProduct.is_active
                  ? 'active'
                  : 'inactive',

              unit:
                createdProduct.unit,

              sku:
                createdProduct.sku,

              barcode:
                createdProduct.barcode,

              wholesalePrice:
                createdProduct.wholesale_price ===
                  null
                  ? null
                  : Number(
                      createdProduct.wholesale_price
                    ),

              minimumStock:
                Number(
                  createdProduct.minimum_stock
                ) || 0,

              supplierId:
                createdProduct.supplier_id,

              expirationDate:
                createdProduct.expiration_date,

              isBulk:
                Boolean(
                  createdProduct.is_bulk
                ),

              storeId:
                createdProduct.store_id,
            }

            set((s) => ({
              products: [
                ...s.products,
                product,
              ],
            }))

            return product
          } catch (error) {
            console.error(
              'Failed to create product:',
              error
            )

            throw error
          }
        },


      // =========================================================
      // UPDATE PRODUCT
      // =========================================================

      updateProduct:
        async (id, data) => {
          if (!id) {
            throw new Error(
              'Product ID is required'
            )
          }

          const storeId =
            get().storeId

          if (!storeId) {
            throw new Error(
              'Store ID is required'
            )
          }

          /*
           * Verify that the product being edited
           * belongs to the active store.
           */

          const existingProduct =
            get().products.find(
              (product) =>
                product.id === id
            )

          if (
            existingProduct &&
            existingProduct.storeId !==
              storeId
          ) {
            throw new Error(
              'Product does not belong to the active store.'
            )
          }

          const updates = {}

          if (
            data.name !==
            undefined
          ) {
            updates.name =
              data.name
          }

          if (
            data.categoryId !==
              undefined ||
            data.category_id !==
              undefined ||
            data.category !==
              undefined
          ) {
            updates.category_id =
              data.categoryId ??
              data.category_id ??
              data.category
          }

          if (
            data.price !==
              undefined ||
            data.sellingPrice !==
              undefined ||
            data.selling_price !==
              undefined
          ) {
            updates.selling_price =
              Number(
                data.price ??
                data.sellingPrice ??
                data.selling_price
              ) || 0
          }

          if (
            data.cost !==
              undefined ||
            data.costPrice !==
              undefined ||
            data.cost_price !==
              undefined
          ) {
            updates.cost_price =
              Number(
                data.cost ??
                data.costPrice ??
                data.cost_price
              ) || 0
          }

          if (
            data.stock !==
              undefined ||
            data.stockQuantity !==
              undefined ||
            data.stock_quantity !==
              undefined
          ) {
            updates.stock_quantity =
              Number(
                data.stock ??
                data.stockQuantity ??
                data.stock_quantity
              ) || 0
          }

          if (
            data.unit !==
            undefined
          ) {
            updates.unit =
              data.unit
          }

          if (
            data.sku !==
            undefined
          ) {
            updates.sku =
              data.sku || null
          }

          if (
            data.barcode !==
            undefined
          ) {
            updates.barcode =
              data.barcode || null
          }

          if (
            data.wholesalePrice !==
              undefined ||
            data.wholesale_price !==
              undefined
          ) {
            const value =
              data.wholesalePrice ??
              data.wholesale_price

            updates.wholesale_price =
              value === '' ||
              value === null
                ? null
                : Number(value)
          }

          if (
            data.minimumStock !==
              undefined ||
            data.minimum_stock !==
              undefined
          ) {
            updates.minimum_stock =
              Number(
                data.minimumStock ??
                data.minimum_stock
              ) || 0
          }

          if (
            data.supplierId !==
              undefined ||
            data.supplier_id !==
              undefined
          ) {
            updates.supplier_id =
              data.supplierId ??
              data.supplier_id ??
              null
          }

          if (
            data.expirationDate !==
              undefined ||
            data.expiration_date !==
              undefined
          ) {
            updates.expiration_date =
              data.expirationDate ??
              data.expiration_date ??
              null
          }

          if (
            data.isBulk !==
              undefined ||
            data.is_bulk !==
              undefined
          ) {
            updates.is_bulk =
              Boolean(
                data.isBulk ??
                data.is_bulk
              )
          }

          if (
            data.status !==
              undefined
          ) {
            updates.is_active =
              data.status ===
              'active'
          }

          try {
            const updatedProduct =
              await updateProductService(
                id,
                updates
              )

            if (
              updatedProduct.store_id !==
              storeId
            ) {
              throw new Error(
                'Updated product belongs to a different store.'
              )
            }

            const product = {
              id:
                updatedProduct.id,

              name:
                updatedProduct.name,

              category:
                updatedProduct.category_id,

              price:
                Number(
                  updatedProduct.selling_price
                ) || 0,

              cost:
                Number(
                  updatedProduct.cost_price
                ) || 0,

              stock:
                Number(
                  updatedProduct.stock_quantity
                ) || 0,

              status:
                updatedProduct.is_active
                  ? 'active'
                  : 'inactive',

              unit:
                updatedProduct.unit,

              sku:
                updatedProduct.sku,

              barcode:
                updatedProduct.barcode,

              wholesalePrice:
                updatedProduct.wholesale_price ===
                  null
                  ? null
                  : Number(
                      updatedProduct.wholesale_price
                    ),

              minimumStock:
                Number(
                  updatedProduct.minimum_stock
                ) || 0,

              supplierId:
                updatedProduct.supplier_id,

              expirationDate:
                updatedProduct.expiration_date,

              isBulk:
                Boolean(
                  updatedProduct.is_bulk
                ),

              storeId:
                updatedProduct.store_id,
            }

            set((s) => ({
              products:
                s.products.map(
                  (p) =>
                    p.id === id
                      ? product
                      : p
                ),
            }))

            return product
          } catch (error) {
            console.error(
              'Failed to update product:',
              error
            )

            throw error
          }
        },


      // =========================================================
      // DELETE / DEACTIVATE PRODUCT
      // =========================================================

      deleteProduct:
        async (id) => {
          if (!id) {
            throw new Error(
              'Product ID is required'
            )
          }

          const storeId =
            get().storeId

          if (!storeId) {
            throw new Error(
              'Store ID is required'
            )
          }

          const product =
            get().products.find(
              (p) =>
                p.id === id
            )

          if (
            product &&
            product.storeId !==
              storeId
          ) {
            throw new Error(
              'Product does not belong to the active store.'
            )
          }

          try {
            await deactivateProduct(
              id
            )

            set((s) => ({
              products:
                s.products.map(
                  (p) =>
                    p.id === id
                      ? {
                          ...p,
                          status:
                            'inactive',
                        }
                      : p
                ),
            }))
          } catch (error) {
            console.error(
              'Failed to deactivate product:',
              error
            )

            throw error
          }
        },


      // =========================================================
      // SALES
      // =========================================================

      sales: [],


      // =========================================================
      // LOAD
      // =========================================================

      loadTxns: [],


      // =========================================================
      // GCASH
      // =========================================================

      gcashTxns: [],


      // =========================================================
      // EXPENSES
      // =========================================================

      expenses: [],


      // =========================================================
      // SUPPLIERS
      // =========================================================

      suppliers: [],


      // =========================================================
      // STOCK HISTORY
      // =========================================================

      stockHistory: [],


      // =========================================================
      // CUSTOMERS / UTANG
      // =========================================================

      customers: [],

      utangEntries: [],

      utangPayments: [],


      // =========================================================
      // BALANCES
      // =========================================================

      cash: 0,

      gcashBalance: 0,

      smartLoadBalance: 0,

      globeLoadBalance: 0,

      cashVault: 0,


      vaultHistory: [],


      // =========================================================
      // FEE TABLES
      // =========================================================

      feeTables: {
        gcash:
          DEFAULT_FEE_TABLE,

        eload:
          DEFAULT_FEE_TABLE,
      },


      // =========================================================
      // OPENING BALANCES
      // =========================================================

      setOpeningBalances:
        async (data) => {
          const storeId =
            get().storeId

          if (!storeId) {
            throw new Error(
              'Store ID is required'
            )
          }

          const result =
            await setOpeningBalances({
              storeId,

              cash:
                data.cash ??
                null,

              gcash:
                data.gcash ??
                null,

              smartLoad:
                data.smartLoad ??
                null,

              globeLoad:
                data.globeLoad ??
                null,
            })

          await get().loadFinancialBalances(
            storeId
          )

          return result
        },


      // =========================================================
      // CASH VAULT
      // =========================================================

      moveToVault:
        async ({
          amount,
          note,
        }) => {
          const storeId =
            get().storeId

          if (!storeId) {
            throw new Error(
              'Store ID is required'
            )
          }

          const amt =
            Number(amount) || 0

          if (amt <= 0) {
            throw new Error(
              'Amount must be greater than zero'
            )
          }

          try {
            const transaction =
              await createCashVaultTransaction({
                storeId,

                transactionType:
                  'DEPOSIT',

                amount:
                  amt,

                note,
              })

            await Promise.all([
              get().loadFinancialBalances(
                storeId
              ),

              get().loadVaultHistory(
                storeId
              ),
            ])

            return transaction
          } catch (error) {
            console.error(
              'Failed to move cash to vault:',
              error
            )

            throw error
          }
        },


      withdrawFromVault:
        async ({
          amount,
          note,
        }) => {
          const storeId =
            get().storeId

          if (!storeId) {
            throw new Error(
              'Store ID is required'
            )
          }

          const amt =
            Number(amount) || 0

          if (amt <= 0) {
            throw new Error(
              'Amount must be greater than zero'
            )
          }

          try {
            const transaction =
              await createCashVaultTransaction({
                storeId,

                transactionType:
                  'WITHDRAW',

                amount:
                  amt,

                note,
              })

            await Promise.all([
              get().loadFinancialBalances(
                storeId
              ),

              get().loadVaultHistory(
                storeId
              ),
            ])

            return transaction
          } catch (error) {
            console.error(
              'Failed to withdraw cash from vault:',
              error
            )

            throw error
          }
        },


      // =========================================================
      // FEE TABLES
      // =========================================================

      updateFeeTable:
        (which, table) =>
          set((s) => ({
            feeTables: {
              ...s.feeTables,

              [which]:
                table,
            },
          })),


      // =========================================================
      // STOCK IN
      // =========================================================

      stockIn:
        async ({
          productId,
          qty,
          cost,
          supplierId,
          ref,
          notes,
        }) => {
          if (!productId) {
            throw new Error(
              'Product ID is required'
            )
          }

          const storeId =
            get().storeId

          if (!storeId) {
            throw new Error(
              'Store ID is required'
            )
          }

          const quantity =
            Number(qty) || 0

          const unitCost =
            Number(cost) || 0

          if (quantity <= 0) {
            throw new Error(
              'Stock quantity must be greater than zero'
            )
          }

          try {
            const product =
              get().products.find(
                (p) =>
                  p.id ===
                  productId
              )

            if (!product) {
              throw new Error(
                'Product not found'
              )
            }

            if (
              product.storeId !==
              storeId
            ) {
              throw new Error(
                'Product does not belong to the active store.'
              )
            }

            const {
              data,
              error,
            } =
              await supabase.rpc(
                'adjust_product_stock',
                {
                  p_product_id:
                    productId,

                  p_quantity_change:
                    quantity,

                  p_movement_type:
                    'STOCK_IN',

                  p_notes:
                    notes || null,

                  p_supplier_id:
                    supplierId ||
                    null,

                  p_reference_number:
                    ref || null,

                  p_unit_cost:
                    unitCost,
                }
              )

            if (error) {
              throw error
            }

            if (supplierId) {
              const {
                error:
                  supplierError,
              } =
                await supabase
                  .from('products')
                  .update({
                    supplier_id:
                      supplierId,
                  })
                  .eq(
                    'id',
                    productId
                  )
                  .eq(
                    'store_id',
                    storeId
                  )

              if (
                supplierError
              ) {
                throw supplierError
              }
            }

            /*
             * Fetch the actual product.
             *
             * IMPORTANT:
             * store_id is included in the query.
             */

            const {
              data:
                updatedProduct,
              error:
                productError,
            } =
              await supabase
                .from('products')
                .select('*')
                .eq(
                  'id',
                  productId
                )
                .eq(
                  'store_id',
                  storeId
                )
                .single()

            if (productError) {
              throw productError
            }

            const updatedProductForStore =
              {
                id:
                  updatedProduct.id,

                name:
                  updatedProduct.name,

                category:
                  updatedProduct.category_id,

                price:
                  Number(
                    updatedProduct.selling_price
                  ),

                cost:
                  Number(
                    updatedProduct.cost_price
                  ),

                stock:
                  Number(
                    updatedProduct.stock_quantity
                  ),

                status:
                  updatedProduct.is_active
                    ? 'active'
                    : 'inactive',

                unit:
                  updatedProduct.unit,

                sku:
                  updatedProduct.sku,

                barcode:
                  updatedProduct.barcode,

                wholesalePrice:
                  updatedProduct.wholesale_price ===
                    null
                    ? null
                    : Number(
                        updatedProduct.wholesale_price
                      ),

                minimumStock:
                  Number(
                    updatedProduct.minimum_stock
                  ),

                minStock:
                  Number(
                    updatedProduct.minimum_stock
                  ),

                supplierId:
                  updatedProduct.supplier_id,

                expirationDate:
                  updatedProduct.expiration_date,

                isBulk:
                  updatedProduct.is_bulk,

                storeId:
                  updatedProduct.store_id,
              }

            set((state) => ({
              products:
                state.products.map(
                  (p) =>
                    p.id ===
                    productId
                      ? updatedProductForStore
                      : p
                ),
            }))

            try {
              await get().loadStockHistory(
                storeId
              )
            } catch (
              historyError
            ) {
              console.error(
                'Stock-in: failed to reload stock history:',
                historyError
              )
            }

            return updatedProductForStore
          } catch (error) {
            console.error(
              'Failed to stock in product:',
              error
            )

            throw error
          }
        },


      // =========================================================
      // POS / CHECKOUT
      // =========================================================

      checkout:
        async ({
          cart,
          discount,
          method,
          amountReceived,
          customerName,
        }) => {
          const state =
            get()

          if (
            !cart ||
            cart.length === 0
          ) {
            throw new Error(
              'Cart is empty'
            )
          }

          const storeId =
            state.storeId

          if (!storeId) {
            throw new Error(
              'Store ID is required'
            )
          }

          if (
            ![
              'Cash',
              'GCash',
              'Utang',
            ].includes(method)
          ) {
            throw new Error(
              'Invalid payment method'
            )
          }

          if (
            method ===
              'Utang' &&
            !customerName?.trim()
          ) {
            throw new Error(
              'Customer name is required for Utang'
            )
          }

          /*
           * Validate every product belongs
           * to the active store.
           */

          for (const item of cart) {
            const product =
              state.products.find(
                (p) =>
                  p.id ===
                  item.id
              )

            if (!product) {
              throw new Error(
                `Product not found: ${item.name}`
              )
            }

            if (
              product.storeId !==
              storeId
            ) {
              throw new Error(
                `Product ${item.name} does not belong to the active store.`
              )
            }

            if (
              Number(item.qty) >
              Number(product.stock)
            ) {
              throw new Error(
                `Not enough stock for ${item.name}`
              )
            }
          }

          const subtotal =
            cart.reduce(
              (sum, item) =>
                sum +
                Number(
                  item.price || 0
                ) *
                  Number(
                    item.qty || 0
                  ),
              0
            )

          const discountAmount =
            Number(discount) || 0

          const total =
            Math.max(
              0,
              subtotal -
                discountAmount
            )

          const cost =
            cart.reduce(
              (sum, item) =>
                sum +
                Number(
                  item.cost || 0
                ) *
                  Number(
                    item.qty || 0
                  ),
              0
            )

          const profit =
            total - cost

          const cashReceived =
            method === 'Cash'
              ? Number(
                  amountReceived
                ) || 0
              : null

          if (
            method === 'Cash' &&
            cashReceived < total
          ) {
            throw new Error(
              'Cash received is less than the total amount'
            )
          }

          const change =
            method === 'Cash'
              ? Math.max(
                  0,
                  cashReceived -
                    total
                )
              : null

          const saleItems =
            cart.map(
              (item) => ({
                product_id:
                  item.id,

                quantity:
                  Number(
                    item.qty
                  ),

                unit_price:
                  Number(
                    item.price ||
                      0
                  ),

                unit_cost:
                  Number(
                    item.cost ||
                      0
                  ),

                subtotal:
                  Number(
                    item.price ||
                      0
                  ) *
                  Number(
                    item.qty ||
                      0
                  ),
              })
            )

          const {
            data,
            error,
          } =
            await supabase.rpc(
              'complete_sale',
              {
                p_store_id:
                  storeId,

                p_items:
                  saleItems,

                p_subtotal:
                  subtotal,

                p_discount:
                  discountAmount,

                p_total_amount:
                  total,

                p_cost_amount:
                  cost,

                p_profit_amount:
                  profit,

                p_payment_method:
                  method,

                p_cash_received:
                  cashReceived,

                p_change_amount:
                  change,

                p_notes:
                  method ===
                  'Utang'
                    ? customerName.trim()
                    : null,
              }
            )

          if (error) {
            console.error(
              'Failed to complete sale:',
              error
            )

            throw error
          }

          const sale = {
            id:
              data.id,

            transactionNumber:
              data.transaction_number,

            ts:
              data.created_at,

            type:
              'Product Sale',

            items:
              cart,

            subtotal:
              Number(
                data.subtotal
              ),

            discount:
              Number(
                data.discount
              ),

            total:
              Number(
                data.total_amount
              ),

            method:
              data.payment_method,

            amountReceived:
              data.cash_received ==
              null
                ? null
                : Number(
                    data.cash_received
                  ),

            change:
              data.change_amount ==
              null
                ? null
                : Number(
                    data.change_amount
                  ),

            profit:
              Number(
                data.profit_amount
              ),

            status:
              data.status,

            storeId:
              data.store_id,

            customerName:
              method ===
              'Utang'
                ? customerName.trim()
                : null,
          }

          /*
           * Only update local state if the returned
           * sale belongs to the current store.
           */

          if (
            data.store_id !==
            storeId
          ) {
            throw new Error(
              'Supabase returned a sale belonging to a different store.'
            )
          }

          set((s) => {
            const products =
              s.products.map(
                (product) => {
                  const item =
                    cart.find(
                      (
                        cartItem
                      ) =>
                        cartItem.id ===
                        product.id
                    )

                  return item
                    ? {
                        ...product,

                        stock:
                          Number(
                            product.stock
                          ) -
                          Number(
                            item.qty
                          ),
                      }
                    : product
                }
              )

            const stockHistory =
              [
                ...s.stockHistory,

                ...cart.map(
                  (item) => {
                    const updatedProduct =
                      products.find(
                        (
                          product
                        ) =>
                          product.id ===
                          item.id
                      )

                    return {
                      id:
                        uid(),

                      ts:
                        data.created_at,

                      product:
                        item.name,

                      added: 0,

                      removed:
                        Number(
                          item.qty
                        ),

                      reason:
                        'Sale',

                      remaining:
                        updatedProduct?.stock ||
                        0,
                    }
                  }
                ),
              ]

            return {
              products,

              stockHistory,

              sales: [
                ...s.sales,
                sale,
              ],
            }
          })

          /*
           * Reload authoritative Supabase data.
           */

          try {
            await Promise.all([
              get().loadProducts(
                storeId
              ),

              get().loadSales(
                storeId
              ),

              get().loadStockHistory(
                storeId
              ),

              get().loadFinancialBalances(
                storeId
              ),

              get().loadGcashTransactions(
                storeId
              ),

              get().loadLoadTransactions(
                storeId
              ),

              get().loadUtangData(
                storeId
              ),
            ])
          } catch (
            refreshError
          ) {
            console.error(
              'Sale completed, but failed to refresh data:',
              refreshError
            )
          }

          return sale
        },


      // =========================================================
      // VOID SALE
      // =========================================================

      voidSale:
        async (id) => {
          if (!id) {
            throw new Error(
              'Sale ID is required'
            )
          }

          const state =
            get()

          const storeId =
            state.storeId

          if (!storeId) {
            throw new Error(
              'Store ID is required'
            )
          }

          const sale =
            state.sales.find(
              (item) =>
                item.id === id
            )

          if (!sale) {
            throw new Error(
              'Sale not found'
            )
          }

          if (
            sale.storeId &&
            sale.storeId !==
              storeId
          ) {
            throw new Error(
              'Sale does not belong to the active store.'
            )
          }

          if (
            sale.status ===
            'Voided'
          ) {
            throw new Error(
              'Sale is already voided'
            )
          }

          try {
            const {
              data,
              error,
            } =
              await supabase.rpc(
                'void_sale',
                {
                  p_sale_id:
                    id,
                }
              )

            if (error) {
              throw error
            }

            await Promise.all([
              get().loadSales(
                storeId
              ),

              get().loadProducts(
                storeId
              ),

              get().loadStockHistory(
                storeId
              ),

              get().loadFinancialBalances(
                storeId
              ),

              get().loadGcashTransactions(
                storeId
              ),

              get().loadLoadTransactions(
                storeId
              ),

              get().loadUtangData(
                storeId
              ),
            ])

            const updatedSale =
              get().sales.find(
                (item) =>
                  item.id === id
              )

            return (
              updatedSale || {
                ...sale,

                status:
                  data?.status ||
                  'Voided',

                voidedAt:
                  data?.voided_at ||
                  null,
              }
            )
          } catch (error) {
            console.error(
              'Failed to void sale:',
              error
            )

            throw error
          }
        },


      // =========================================================
      // LOAD — QUICK SELL
      // =========================================================

      sellLoad:
        async ({
          phone,
          network,
          amount,
          sellPrice,
          status =
            'Successful',
        }) => {
          const storeId =
            get().storeId

          if (!storeId) {
            throw new Error(
              'Store ID is required'
            )
          }

          const result =
            await createLoadTransaction({
              storeId,

              type:
                'Cash-In',

              network,

              amount,

              fee: 0,

              feePaidVia:
                'Cash',

              phone,

              customerName:
                null,

              ref:
                null,

              sellPrice,

              status,
            })

          await Promise.all([
            get().loadFinancialBalances(
              storeId
            ),

            get().loadLoadTransactions(
              storeId
            ),
          ])

          return result
        },


      loadTransaction:
        async ({
          type,
          network,
          amount,
          fee,
          feePaidVia,
          customerName,
          ref,
        }) => {
          const storeId =
            get().storeId

          if (!storeId) {
            throw new Error(
              'Store ID is required'
            )
          }

          const result =
            await createLoadTransaction({
              storeId,

              type,

              network,

              amount,

              fee,

              feePaidVia,

              phone:
                null,

              customerName,

              ref,

              sellPrice:
                null,

              status:
                'Successful',
            })

          await Promise.all([
            get().loadFinancialBalances(
              storeId
            ),

            get().loadLoadTransactions(
              storeId
            ),
          ])

          return result
        },


      // =========================================================
      // GCASH
      // =========================================================

      gcashService:
        async ({
          storeId: suppliedStoreId,
          type,
          customerName,
          amount,
          fee,
          feePaidVia,
          ref,
        }) => {
          /*
           * IMPORTANT:
           *
           * Do not trust a store ID supplied by a page.
           * The active authenticated store in Zustand
           * is the source of truth.
           */

          const storeId =
            get().storeId

          if (!storeId) {
            throw new Error(
              'Store ID is required'
            )
          }

          /*
           * Warn if an old/different store ID was passed.
           */

          if (
            suppliedStoreId &&
            suppliedStoreId !==
              storeId
          ) {
            console.warn(
              'GCash: Ignoring supplied store ID because it does not match the active store.'
            )
          }

          const result =
            await createGcashTransaction({
              storeId,

              type,

              customerName,

              amount,

              fee,

              feePaidVia,

              ref,
            })

          await Promise.all([
            get().loadFinancialBalances(
              storeId
            ),

            get().loadGcashTransactions(
              storeId
            ),
          ])

          return result
        },


      // =========================================================
      // EXPENSES
      // =========================================================

      loadExpenses:
        async (storeId) => {
          if (!storeId) {
            throw new Error(
              'Store ID is required'
            )
          }

          try {
            const data =
              await getExpenses(
                storeId
              )

            const expenses =
              data.map(
                (expense) => ({
                  id:
                    expense.id,

                  cat:
                    expense.category,

                  amount:
                    Number(
                      expense.amount
                    ),

                  note:
                    expense.description ||
                    '',

                  paymentMethod:
                    expense.payment_method ||
                    'Cash',

                  ts:
                    expense.created_at,

                  storeId:
                    expense.store_id,

                  createdBy:
                    expense.created_by,
                })
              )

            set({
              expenses,
            })

            console.log(
              `Loaded ${expenses.length} expenses from Supabase`
            )

            return expenses
          } catch (error) {
            console.error(
              'Failed to load expenses:',
              error
            )

            throw error
          }
        },


      addExpense:
        async (data) => {
          const storeId =
            get().storeId

          if (!storeId) {
            throw new Error(
              'Store ID is required'
            )
          }

          try {
            const expense =
              await createExpense({
                store_id:
                  storeId,

                category:
                  data.cat,

                description:
                  data.note,

                amount:
                  data.amount,

                payment_method:
                  data.paymentMethod ||
                  'Cash',
              })

            if (
              expense.store_id !==
              storeId
            ) {
              throw new Error(
                'Created expense belongs to a different store.'
              )
            }

            const expenseForStore =
              {
                id:
                  expense.id,

                cat:
                  expense.category,

                amount:
                  Number(
                    expense.amount
                  ),

                note:
                  expense.description ||
                  '',

                paymentMethod:
                  expense.payment_method ||
                  'Cash',

                ts:
                  expense.created_at,

                storeId:
                  expense.store_id,

                createdBy:
                  expense.created_by,
              }

            set((state) => ({
              expenses: [
                ...state.expenses,
                expenseForStore,
              ],
            }))

            try {
              await get().loadFinancialBalances(
                storeId
              )
            } catch (
              balanceError
            ) {
              console.error(
                'Expense added, but failed to refresh financial balances:',
                balanceError
              )
            }

            return expenseForStore
          } catch (error) {
            console.error(
              'Failed to add expense:',
              error
            )

            throw error
          }
        },


      // =========================================================
      // SUPPLIERS
      // =========================================================

      addSupplier:
        async (data) => {
          const storeId =
            get().storeId

          if (!storeId) {
            throw new Error(
              'Store ID is required'
            )
          }

          try {
            const supplier =
              await createSupplier({
                store_id:
                  storeId,

                name:
                  data.name,

                contact:
                  data.contact,

                address:
                  data.address,
              })

            if (
              supplier.store_id !==
              storeId
            ) {
              throw new Error(
                'Created supplier belongs to a different store.'
              )
            }

            const supplierForStore =
              {
                id:
                  supplier.id,

                name:
                  supplier.name,

                contactNumber:
                  supplier.contact_number ||
                  '',

                address:
                  supplier.address ||
                  '',

                balance: 0,

                purchases: [],

                storeId:
                  supplier.store_id,
              }

            set((state) => ({
              suppliers: [
                ...state.suppliers,
                supplierForStore,
              ],
            }))

            return supplierForStore
          } catch (error) {
            console.error(
              'Failed to add supplier:',
              error
            )

            throw error
          }
        },


      updateSupplier:
        async (
          supplierId,
          data
        ) => {
          if (!supplierId) {
            throw new Error(
              'Supplier ID is required'
            )
          }

          const storeId =
            get().storeId

          if (!storeId) {
            throw new Error(
              'Store ID is required'
            )
          }

          const existingSupplier =
            get().suppliers.find(
              (supplier) =>
                supplier.id ===
                supplierId
            )

          if (
            existingSupplier &&
            existingSupplier.storeId !==
              storeId
          ) {
            throw new Error(
              'Supplier does not belong to the active store.'
            )
          }

          try {
            const supplier =
              await updateSupplierService(
                supplierId,
                {
                  name:
                    data.name,

                  contact:
                    data.contact,

                  address:
                    data.address,
                }
              )

            if (
              supplier.store_id !==
              storeId
            ) {
              throw new Error(
                'Updated supplier belongs to a different store.'
              )
            }

            const supplierForStore =
              {
                id:
                  supplier.id,

                name:
                  supplier.name,

                contactNumber:
                  supplier.contact_number ||
                  '',

                address:
                  supplier.address ||
                  '',

                balance: 0,

                purchases: [],

                storeId:
                  supplier.store_id,
              }

            set((state) => ({
              suppliers:
                state.suppliers.map(
                  (s) =>
                    s.id ===
                    supplierId
                      ? {
                          ...s,
                          ...supplierForStore,
                        }
                      : s
                ),
            }))

            return supplierForStore
          } catch (error) {
            console.error(
              'Failed to update supplier:',
              error
            )

            throw error
          }
        },


      deleteSupplier:
        async (
          supplierId
        ) => {
          if (!supplierId) {
            throw new Error(
              'Supplier ID is required'
            )
          }

          const storeId =
            get().storeId

          if (!storeId) {
            throw new Error(
              'Store ID is required'
            )
          }

          const supplier =
            get().suppliers.find(
              (s) =>
                s.id ===
                supplierId
            )

          if (
            supplier &&
            supplier.storeId !==
              storeId
          ) {
            throw new Error(
              'Supplier does not belong to the active store.'
            )
          }

          try {
            await deleteSupplierService(
              supplierId
            )

            set((state) => ({
              suppliers:
                state.suppliers.filter(
                  (s) =>
                    s.id !==
                    supplierId
                ),
            }))
          } catch (error) {
            console.error(
              'Failed to delete supplier:',
              error
            )

            throw error
          }
        },
    }),

    {
      name: 'rms_den',

      /*
       * IMPORTANT:
       *
       * Only fee tables are persisted locally.
       *
       * Products, sales, transactions, balances,
       * suppliers, etc. ALWAYS come from Supabase.
       *
       * This prevents another account's data from
       * surviving a logout/login.
       */

      partialize: (state) => ({
        feeTables:
          state.feeTables,
      }),
    }
  )
)