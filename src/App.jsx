import { useEffect, useState } from 'react'

const initialSales = [
  { id: 'SAL-001', customer: 'Amina Hassan', item: 'Cooking Oil', amount: 2500, status: 'Completed', date: '2026-10-01' },
  { id: 'SAL-002', customer: 'Peter Lokiru', item: 'Maize Flour', amount: 1800, status: 'Completed', date: '2026-10-02' },
  { id: 'SAL-003', customer: 'Mary Naserian', item: 'Laundry Soap', amount: 950, status: 'Pending', date: '2026-10-03' },
  { id: 'SAL-004', customer: 'John Ekal', item: 'Sugar', amount: 1200, status: 'Completed', date: '2026-10-04' },
]

const initialProducts = [
  { name: 'Cooking Oil', category: 'Food', stock: 24, price: 350 },
  { name: 'Maize Flour', category: 'Food', stock: 8, price: 180 },
  { name: 'Laundry Soap', category: 'Household', stock: 5, price: 100 },
  { name: 'Sugar', category: 'Food', stock: 32, price: 170 },
]

const initialExpenses = [
  { id: 'EXP-001', description: 'Shop rent', category: 'Rent', amount: 8000, date: '2026-10-01' },
  { id: 'EXP-002', description: 'Stock transport', category: 'Transport', amount: 1200, date: '2026-10-05' },
  { id: 'EXP-003', description: 'Electricity', category: 'Utilities', amount: 500, date: '2026-10-10' },
  { id: 'EXP-004', description: 'Packaging materials', category: 'Supplies', amount: 1000, date: '2026-10-12' },
  { id: 'EXP-005', description: 'Business permit', category: 'Other', amount: 2000, date: '2026-10-15' },
]

const navigation = [
  { name: 'Dashboard', icon: '▦' },
  { name: 'Sales', icon: '↗' },
  { name: 'Expenses', icon: '↘' },
  { name: 'Inventory', icon: '▤' },
  { name: 'Customers', icon: '♙' },
  { name: 'Reports', icon: '▥' },
]

const expenseCategories = [
  'Rent',
  'Transport',
  'Utilities',
  'Stock Purchase',
  'Supplies',
  'Salaries',
  'Other',
]

function formatMoney(amount) {
  return `KSh ${amount.toLocaleString('en-KE', {
    maximumFractionDigits: 2,
  })}`
}

function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const savedValue = window.localStorage.getItem(key)
      return savedValue !== null ? JSON.parse(savedValue) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Unable to save data to browser storage:', error)
    }
  }, [key, value])

  return [value, setValue]
}

function today() {
  return new Date().toLocaleDateString('en-CA')
}

function SectionTitle({ title, description }) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = status === 'Completed'
    ? 'bg-emerald-50 text-emerald-700'
    : status === 'Pending'
      ? 'bg-amber-50 text-amber-700'
      : 'bg-red-50 text-red-700'

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>
      {status}
    </span>
  )
}

function App() {
  const [activePage, setActivePage] = useState('Dashboard')
  const [sales, setSales] = usePersistentState(
    'kakuma-business-sales',
    initialSales,
  )
  const [products, setProducts] = usePersistentState(
    'kakuma-business-products',
    initialProducts,
  )
  const [expenses, setExpenses] = usePersistentState(
    'kakuma-business-expenses',
    initialExpenses,
  )

  const [customer, setCustomer] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedCustomerHistory, setSelectedCustomerHistory] = useState('')
  const [customerRecords, setCustomerRecords] = usePersistentState(
    'kakuma-business-customer-records',
    [],
  )
  const [newCustomerName, setNewCustomerName] = useState('')
  const [newCustomerPhone, setNewCustomerPhone] = useState('')
  const [editingCustomer, setEditingCustomer] = useState('')
  const [customerMessage, setCustomerMessage] = useState('')
  const [customerError, setCustomerError] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(initialProducts[0].name)
  const [quantity, setQuantity] = useState('1')
  const [saleStatus, setSaleStatus] = useState('Completed')
  const [saleMessage, setSaleMessage] = useState('')
  const [saleError, setSaleError] = useState(false)

  const [expenseDescription, setExpenseDescription] = useState('')
  const [expenseCategory, setExpenseCategory] = useState('Transport')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseDate, setExpenseDate] = useState(today())
  const [expenseMessage, setExpenseMessage] = useState('')
  const [expenseError, setExpenseError] = useState(false)

  const [productSearch, setProductSearch] = useState('')
  const [newProductName, setNewProductName] = useState('')
  const [newProductCategory, setNewProductCategory] = useState('Food')
  const [newProductStock, setNewProductStock] = useState('0')
  const [newProductPrice, setNewProductPrice] = useState('')
  const [inventoryMessage, setInventoryMessage] = useState('')
  const [inventoryError, setInventoryError] = useState(false)

  const [restockProduct, setRestockProduct] = useState('')
  const [restockQuantity, setRestockQuantity] = useState('1')
  const totalSales = sales.reduce((total, sale) => total + sale.amount, 0)
  const totalExpenses = expenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  )
  const netProfit = totalSales - totalExpenses
  const productCount = products.length
  const lowStockProducts = products.filter((product) => product.stock <= 8)

  const salesExpenseChartData = [...new Set([
    ...sales.map((sale) => sale.date),
    ...expenses.map((expense) => expense.date),
  ])]
    .filter(Boolean)
    .sort()
    .slice(-7)
    .map((date) => ({
      date,
      sales: sales
        .filter((sale) => sale.date === date)
        .reduce((total, sale) => total + sale.amount, 0),
      expenses: expenses
        .filter((expense) => expense.date === date)
        .reduce((total, expense) => total + expense.amount, 0),
    }))

  const chartMaximum = Math.max(
    1,
    ...salesExpenseChartData.flatMap((day) => [day.sales, day.expenses]),
  )

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()),
  )

  const customers = [...new Set(
    sales.map((sale) => sale.customer.trim()).filter(Boolean),
  )]

  const salePreviewProduct = products.find(
    (product) => product.name === selectedProduct,
  )
  const salePreview = salePreviewProduct
    ? salePreviewProduct.price * Math.max(0, Number(quantity) || 0)
    : 0

  function handleCustomerSubmit(event) {
    event.preventDefault()
    setCustomerMessage('')
    setCustomerError(false)

    const name = newCustomerName.trim()
    const phone = newCustomerPhone.trim()

    if (!name || !phone) {
      setCustomerMessage('Please enter the customer name and phone number.')
      setCustomerError(true)
      return
    }

    if (editingCustomer) {
      const existingRecord = customerRecords.some(
        (record) =>
          record.name.toLowerCase() === editingCustomer.toLowerCase(),
      )

      if (existingRecord) {
        setCustomerRecords((current) =>
          current.map((record) =>
            record.name.toLowerCase() === editingCustomer.toLowerCase()
              ? { ...record, phone }
              : record,
          ),
        )
      } else {
        setCustomerRecords((current) => [
          ...current,
          {
            id: `CUS-${Date.now()}`,
            name: editingCustomer,
            phone,
          },
        ])
      }

      setNewCustomerName('')
      setNewCustomerPhone('')
      setEditingCustomer('')
      setCustomerMessage('Customer phone number updated successfully.')
      return
    }

    const existingCustomer = customerRecords.some(
      (record) => record.name.toLowerCase() === name.toLowerCase(),
    )

    if (existingCustomer) {
      setCustomerMessage('This customer is already registered.')
      setCustomerError(true)
      return
    }

    setCustomerRecords((current) => [
      ...current,
      { id: `CUS-${Date.now()}`, name, phone },
    ])
    setNewCustomerName('')
    setNewCustomerPhone('')
    setCustomerMessage('Customer registered successfully.')
  }

  function handleSaleSubmit(event) {
    event.preventDefault()
    setSaleMessage('')
    setSaleError(false)

    const product = products.find((item) => item.name === selectedProduct)
    const saleQuantity = Number(quantity)

    if (!customer.trim()) {
      setSaleMessage('Please enter the customer name.')
      setSaleError(true)
      return
    }

    if (!product || !Number.isInteger(saleQuantity) || saleQuantity < 1) {
      setSaleMessage('Select a product and enter a valid whole-number quantity.')
      setSaleError(true)
      return
    }

    if (saleQuantity > product.stock) {
      setSaleMessage(`Only ${product.stock} units of ${product.name} are available.`)
      setSaleError(true)
      return
    }

    const newSale = {
      id: `SAL-${Date.now()}`,
      customer: customer.trim(),
      item: product.name,
      amount: product.price * saleQuantity,
      status: saleStatus,
      date: today(),
    }

    setSales((current) => [newSale, ...current])
    setProducts((current) =>
      current.map((item) =>
        item.name === product.name
          ? { ...item, stock: item.stock - saleQuantity }
          : item,
      ),
    )

    setCustomer('')
    setQuantity('1')
    setSaleMessage('Sale recorded successfully. Inventory has been updated.')
  }

  function handleExpenseSubmit(event) {
    event.preventDefault()
    setExpenseMessage('')
    setExpenseError(false)

    const amount = Number(expenseAmount)

    if (!expenseDescription.trim()) {
      setExpenseMessage('Please enter an expense description.')
      setExpenseError(true)
      return
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setExpenseMessage('Enter an amount greater than zero.')
      setExpenseError(true)
      return
    }

    if (!expenseDate) {
      setExpenseMessage('Please select the expense date.')
      setExpenseError(true)
      return
    }

    const newExpense = {
      id: `EXP-${Date.now()}`,
      description: expenseDescription.trim(),
      category: expenseCategory,
      amount,
      date: expenseDate,
    }

    setExpenses((current) => [newExpense, ...current])
    setExpenseDescription('')
    setExpenseCategory('Transport')
    setExpenseAmount('')
    setExpenseDate(today())
    setExpenseMessage('Expense recorded successfully.')
  }

  function handleAddProduct(event) {
    event.preventDefault()
    setInventoryMessage('')
    setInventoryError(false)

    const name = newProductName.trim()
    const stock = Number(newProductStock)
    const price = Number(newProductPrice)

    if (!name) {
      setInventoryMessage('Please enter a product name.')
      setInventoryError(true)
      return
    }

    if (products.some((product) => product.name.toLowerCase() === name.toLowerCase())) {
      setInventoryMessage('A product with this name already exists.')
      setInventoryError(true)
      return
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setInventoryMessage('Stock must be a whole number of zero or more.')
      setInventoryError(true)
      return
    }

    if (!Number.isFinite(price) || price <= 0) {
      setInventoryMessage('Enter a selling price greater than zero.')
      setInventoryError(true)
      return
    }

    const product = {
      name,
      category: newProductCategory,
      stock,
      price,
    }

    setProducts((current) => [...current, product])
    setNewProductName('')
    setNewProductCategory('Food')
    setNewProductStock('0')
    setNewProductPrice('')
    setInventoryMessage(`${name} added successfully.`)
  }

  function handleRestockProduct(event) {
    event.preventDefault()
    setInventoryMessage('')
    setInventoryError(false)

    const amount = Number(restockQuantity)

    if (!restockProduct) {
      setInventoryMessage('Please select a product to restock.')
      setInventoryError(true)
      return
    }

    if (!Number.isInteger(amount) || amount < 1) {
      setInventoryMessage('Restock quantity must be a whole number greater than zero.')
      setInventoryError(true)
      return
    }

    setProducts((current) =>
      current.map((product) =>
        product.name === restockProduct
          ? { ...product, stock: product.stock + amount }
          : product,
      ),
    )

    setInventoryMessage(`${restockProduct} restocked with ${amount} units.`)
    setRestockQuantity('1')
  }
  function downloadCsv(filename, headers, rows) {
    const escapeCell = (value) => {
      const text = String(value ?? '')
      return '"' + text.replace(/"/g, '""') + '"'
    }

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCell).join(','))
      .join('\r\n')

    const blob = new Blob(['\uFEFF', csv], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  function exportSalesReport() {
    downloadCsv(
      'kakuma-sales-report.csv',
      ['Sale ID', 'Customer', 'Product', 'Amount (KSh)', 'Status', 'Date'],
      sales.map((sale) => [
        sale.id, sale.customer, sale.item, sale.amount, sale.status, sale.date,
      ]),
    )
  }

  function exportExpensesReport() {
    downloadCsv(
      'kakuma-expenses-report.csv',
      ['Expense ID', 'Description', 'Category', 'Amount (KSh)', 'Date'],
      expenses.map((expense) => [
        expense.id, expense.description, expense.category,
        expense.amount, expense.date,
      ]),
    )
  }

  function exportInventoryReport() {
    downloadCsv(
      'kakuma-inventory-report.csv',
      ['Product', 'Category', 'Stock (units)', 'Selling Price (KSh)'],
      products.map((product) => [
        product.name, product.category, product.stock, product.price,
      ]),
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 md:flex">
      <aside className="flex w-full flex-col bg-slate-900 text-white md:min-h-screen md:w-64 md:shrink-0">
        <div className="border-b border-slate-700 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-xl font-bold">
              K
            </div>
            <div>
              <h1 className="text-base font-bold">Kakuma Digital</h1>
              <p className="text-xs text-slate-400">Business Assistant</p>
            </div>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto p-3 md:flex-1 md:flex-col md:overflow-visible md:p-4">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => setActivePage(item.name)}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                activePage === item.name
                  ? 'bg-emerald-500 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="hidden border-t border-slate-700 p-5 md:block">
          <p className="text-sm font-medium">Small Business Management</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Helping local businesses manage sales, expenses and stock.
          </p>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <div>
            <h2 className="text-2xl font-bold">{activePage}</h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage your business from one place.
            </p>
          </div>
          <div className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            Kakuma, Kenya
          </div>
        </header>

        <div className="space-y-6 p-5 md:p-8">
          {activePage === 'Dashboard' && (
            <>
              <section>
                <h3 className="text-lg font-bold">Business Overview</h3>
                <p className="mt-1 text-sm text-slate-500">
                  A summary of your recorded business activity.
                </p>
              </section>

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: 'Total Sales',
                    value: formatMoney(totalSales),
                    icon: '↗',
                    note: `${sales.length} recorded transactions`,
                  },
                  {
                    label: 'Total Expenses',
                    value: formatMoney(totalExpenses),
                    icon: '↘',
                    note: `${expenses.length} recorded expenses`,
                  },
                  {
                    label: 'Net Balance',
                    value: formatMoney(netProfit),
                    icon: '◈',
                    note: 'Sales minus expenses',
                  },
                  {
                    label: 'Products',
                    value: productCount,
                    icon: '▤',
                    note: `${lowStockProducts.length} low-stock items`,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-500">
                        {stat.label}
                      </p>
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl text-emerald-700">
                        {stat.icon}
                      </span>
                    </div>
                    <p className="mt-4 break-words text-2xl font-bold">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">{stat.note}</p>
                  </div>
                ))}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionTitle
                  title="Sales vs Expenses"
                  description="Compare recorded sales and expenses across your latest seven transaction dates."
                />

                <div className="mb-5 flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm bg-emerald-500" />
                    Sales
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm bg-rose-400" />
                    Expenses
                  </span>
                </div>

                {salesExpenseChartData.length === 0 ? (
                  <p className="rounded-lg bg-slate-50 p-5 text-sm text-slate-500">
                    Record a sale or expense to see your business performance chart.
                  </p>
                ) : (
                  <div className="space-y-5">
                    {salesExpenseChartData.map((day) => (
                      <div key={day.date}>
                        <p className="mb-2 text-xs font-medium text-slate-500">
                          {day.date}
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="w-16 text-xs text-slate-600">Sales</span>
                            <div className="h-5 flex-1 rounded bg-slate-100">
                              <div
                                className="h-5 rounded bg-emerald-500"
                                style={{
                                  width: `${day.sales > 0 ? Math.max(day.sales / chartMaximum * 100, 1) : 0}%`,
                                }}
                              />
                            </div>
                            <span className="w-28 text-right text-xs font-semibold">
                              {formatMoney(day.sales)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="w-16 text-xs text-slate-600">Expenses</span>
                            <div className="h-5 flex-1 rounded bg-slate-100">
                              <div
                                className="h-5 rounded bg-rose-400"
                                style={{
                                  width: `${day.expenses > 0 ? Math.max(day.expenses / chartMaximum * 100, 1) : 0}%`,
                                }}
                              />
                            </div>
                            <span className="w-28 text-right text-xs font-semibold">
                              {formatMoney(day.expenses)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <SectionTitle
                    title="Recent Sales"
                    description="Your latest recorded transactions."
                  />
                  <div className="space-y-4">
                    {sales.slice(0, 5).map((sale) => (
                      <div
                        key={sale.id}
                        className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                      >
                        <div>
                          <p className="font-semibold">{sale.customer}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {sale.item} · {sale.date}
                          </p>
                        </div>
                        <p className="font-bold">{formatMoney(sale.amount)}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setActivePage('Sales')}
                    className="mt-5 text-sm font-semibold text-emerald-700 hover:underline"
                  >
                    View all sales →
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <SectionTitle
                    title="Inventory Overview"
                    description="Keep track of available stock."
                  />
                  <div className="space-y-4">
                    {products.map((product) => (
                      <div key={product.name}>
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-sm text-slate-500">
                              {product.category}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{product.stock} units</p>
                            <p className={`text-xs ${product.stock <= 8 ? 'text-amber-700' : 'text-emerald-700'}`}>
                              {product.stock <= 8 ? 'Low stock' : 'In stock'}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-slate-100">
                          <div
                            className={`h-2 rounded-full ${product.stock <= 8 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                            style={{
                              width: `${Math.min(product.stock / 32 * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setActivePage('Inventory')}
                    className="mt-5 text-sm font-semibold text-emerald-700 hover:underline"
                  >
                    Manage inventory →
                  </button>
                </div>
              </section>

              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-amber-900">
                      Low-Stock Alerts
                    </h3>
                    <p className="mt-1 text-sm text-amber-800">
                      Products with 8 units or fewer need your attention.
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                    {lowStockProducts.length} {lowStockProducts.length === 1 ? 'product' : 'products'}
                  </span>
                </div>

                {lowStockProducts.length === 0 ? (
                  <p className="mt-4 rounded-lg bg-white p-4 text-sm text-emerald-700">
                    All products have sufficient stock.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {lowStockProducts.map((product) => (
                      <div
                        key={product.name}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-100 bg-white p-4"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">
                            {product.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {product.category}
                          </p>
                        </div>
                        <p className="font-bold text-amber-700">
                          {product.stock} units left
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setActivePage('Inventory')}
                  className="mt-5 rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800"
                >
                  Restock products →
                </button>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionTitle
                  title="Recent Expenses"
                  description="Review costs recorded for your business."
                />
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[550px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-3 pr-4 font-medium">Description</th>
                        <th className="py-3 pr-4 font-medium">Category</th>
                        <th className="py-3 pr-4 font-medium">Date</th>
                        <th className="py-3 text-right font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.slice(0, 4).map((expense) => (
                        <tr key={expense.id} className="border-b border-slate-100 last:border-0">
                          <td className="py-3 pr-4 font-medium">{expense.description}</td>
                          <td className="py-3 pr-4">{expense.category}</td>
                          <td className="py-3 pr-4">{expense.date}</td>
                          <td className="py-3 text-right font-semibold">{formatMoney(expense.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  onClick={() => setActivePage('Expenses')}
                  className="mt-5 text-sm font-semibold text-emerald-700 hover:underline"
                >
                  Manage expenses →
                </button>
              </section>
            </>
          )}

          {activePage === 'Sales' && (
            <>
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionTitle
                  title="Record a Sale"
                  description="Enter the transaction details below."
                />
                <form onSubmit={handleSaleSubmit} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <label className="text-sm font-medium">
                    Customer name
                    <input
                      value={customer}
                      onChange={(event) => setCustomer(event.target.value)}
                      placeholder="Enter customer name"
                      className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </label>

                  <label className="text-sm font-medium">
                    Product
                    <select
                      value={selectedProduct}
                      onChange={(event) => setSelectedProduct(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal outline-none focus:border-emerald-500"
                    >
                      {products.map((product) => (
                        <option key={product.name} value={product.name}>
                          {product.name} — {formatMoney(product.price)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="text-sm font-medium">
                    Quantity
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={quantity}
                      onChange={(event) => setQuantity(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal outline-none focus:border-emerald-500"
                    />
                  </label>

                  <label className="text-sm font-medium">
                    Payment status
                    <select
                      value={saleStatus}
                      onChange={(event) => setSaleStatus(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal outline-none focus:border-emerald-500"
                    >
                      <option>Completed</option>
                      <option>Pending</option>
                    </select>
                  </label>

                  <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2 xl:col-span-4">
                    <p className="text-sm text-slate-600">
                      Sale total: <span className="font-bold text-slate-900">{formatMoney(salePreview)}</span>
                    </p>
                    <button
                      type="submit"
                      className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      Record Sale
                    </button>
                  </div>
                  {saleMessage && (
                    <p className={`sm:col-span-2 xl:col-span-4 text-sm ${saleError ? 'text-red-600' : 'text-emerald-700'}`}>
                      {saleMessage}
                    </p>
                  )}
                </form>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionTitle title="Sales History" description={`${sales.length} recorded transactions.`} />
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-3 pr-4 font-medium">Sale ID</th>
                        <th className="py-3 pr-4 font-medium">Customer</th>
                        <th className="py-3 pr-4 font-medium">Product</th>
                        <th className="py-3 pr-4 font-medium">Date</th>
                        <th className="py-3 pr-4 font-medium">Status</th>
                        <th className="py-3 text-right font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((sale) => (
                        <tr key={sale.id} className="border-b border-slate-100 last:border-0">
                          <td className="py-4 pr-4 text-slate-500">{sale.id}</td>
                          <td className="py-4 pr-4 font-medium">{sale.customer}</td>
                          <td className="py-4 pr-4">{sale.item}</td>
                          <td className="py-4 pr-4">{sale.date}</td>
                          <td className="py-4 pr-4"><StatusBadge status={sale.status} /></td>
                          <td className="py-4 text-right font-semibold">{formatMoney(sale.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {activePage === 'Expenses' && (
            <>
              <section className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Total Expenses</p>
                  <p className="mt-3 text-2xl font-bold">{formatMoney(totalExpenses)}</p>
                  <p className="mt-2 text-xs text-slate-500">{expenses.length} recorded expenses</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Net Balance</p>
                  <p className={`mt-3 text-2xl font-bold ${netProfit < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                    {formatMoney(netProfit)}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">Total sales minus total expenses</p>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionTitle
                  title="Record an Expense"
                  description="Record business costs to understand where your money goes."
                />
                <form onSubmit={handleExpenseSubmit} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <label className="text-sm font-medium xl:col-span-2">
                    Expense description
                    <input
                      value={expenseDescription}
                      onChange={(event) => setExpenseDescription(event.target.value)}
                      placeholder="e.g. Shop transport"
                      className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </label>

                  <label className="text-sm font-medium">
                    Category
                    <select
                      value={expenseCategory}
                      onChange={(event) => setExpenseCategory(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal outline-none focus:border-emerald-500"
                    >
                      {expenseCategories.map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                    </select>
                  </label>

                  <label className="text-sm font-medium">
                    Amount (KSh)
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={expenseAmount}
                      onChange={(event) => setExpenseAmount(event.target.value)}
                      placeholder="e.g. 500"
                      className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal outline-none focus:border-emerald-500"
                    />
                  </label>

                  <label className="text-sm font-medium">
                    Expense date
                    <input
                      type="date"
                      value={expenseDate}
                      onChange={(event) => setExpenseDate(event.target.value)}
                      max={today()}
                      className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal outline-none focus:border-emerald-500"
                    />
                  </label>

                  <div className="flex items-end sm:col-span-2 xl:col-span-3">
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 sm:w-auto"
                    >
                      Record Expense
                    </button>
                  </div>

                  {expenseMessage && (
                    <p className={`sm:col-span-2 xl:col-span-4 text-sm ${expenseError ? 'text-red-600' : 'text-emerald-700'}`}>
                      {expenseMessage}
                    </p>
                  )}
                </form>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionTitle title="Expense History" description="All your recorded business expenses." />
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-3 pr-4 font-medium">Expense ID</th>
                        <th className="py-3 pr-4 font-medium">Description</th>
                        <th className="py-3 pr-4 font-medium">Category</th>
                        <th className="py-3 pr-4 font-medium">Date</th>
                        <th className="py-3 text-right font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((expense) => (
                        <tr key={expense.id} className="border-b border-slate-100 last:border-0">
                          <td className="py-4 pr-4 text-slate-500">{expense.id}</td>
                          <td className="py-4 pr-4 font-medium">{expense.description}</td>
                          <td className="py-4 pr-4">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
                              {expense.category}
                            </span>
                          </td>
                          <td className="py-4 pr-4">{expense.date}</td>
                          <td className="py-4 text-right font-semibold">{formatMoney(expense.amount)}</td>
                        </tr>
                      ))}
                      {expenses.length === 0 && (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-slate-500">
                            No expenses recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-200">
                        <td colSpan="4" className="py-4 pr-4 text-right font-bold">Total Expenses</td>
                        <td className="py-4 text-right font-bold">{formatMoney(totalExpenses)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </section>
            </>
          )}

          {activePage === 'Inventory' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionTitle
                title="Inventory Management"
                description="Review product quantities and selling prices. Sales automatically reduce stock."
              />
              <div className="mb-6 grid gap-6 lg:grid-cols-2">
                <form onSubmit={handleAddProduct} className="rounded-xl border border-slate-200 p-5">
                  <h3 className="mb-4 text-lg font-bold">Add Product</h3>
                  <label className="mb-1 block text-sm font-medium">Product name</label>
                  <input required value={newProductName} onChange={(event) => setNewProductName(event.target.value)} placeholder="e.g. Rice" className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2" />

                  <label className="mb-1 block text-sm font-medium">Category</label>
                  <select value={newProductCategory} onChange={(event) => setNewProductCategory(event.target.value)} className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2">
                    <option value="Food">Food</option>
                    <option value="Household">Household</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Stationery">Stationery</option>
                    <option value="Other">Other</option>
                  </select>

                  <label className="mb-1 block text-sm font-medium">Starting stock</label>
                  <input required type="number" min="0" step="1" value={newProductStock} onChange={(event) => setNewProductStock(event.target.value)} className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2" />

                  <label className="mb-1 block text-sm font-medium">Selling price (KSh)</label>
                  <input required type="number" min="0.01" step="0.01" value={newProductPrice} onChange={(event) => setNewProductPrice(event.target.value)} placeholder="e.g. 250" className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2" />

                  <button type="submit" className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700">Add Product</button>
                </form>

                <form onSubmit={handleRestockProduct} className="rounded-xl border border-slate-200 p-5">
                  <h3 className="mb-4 text-lg font-bold">Restock Product</h3>
                  <label className="mb-1 block text-sm font-medium">Select product</label>
                  <select required value={restockProduct} onChange={(event) => setRestockProduct(event.target.value)} className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2">
                    <option value="">Choose a product</option>
                    {products.map((product) => (
                      <option key={product.name} value={product.name}>
                        {product.name} — {product.stock} units
                      </option>
                    ))}
                  </select>

                  <label className="mb-1 block text-sm font-medium">Quantity to add</label>
                  <input required type="number" min="1" step="1" value={restockQuantity} onChange={(event) => setRestockQuantity(event.target.value)} className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2" />

                  <button type="submit" disabled={products.length === 0} className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">Restock Inventory</button>
                </form>
              </div>

              {inventoryMessage && (
                <p role="status" className={`mb-4 rounded-lg px-4 py-3 text-sm ${inventoryError ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {inventoryMessage}
                </p>
              )}

              <input
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
                placeholder="Search products..."
                className="mb-5 w-full max-w-sm rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[550px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-3 pr-4 font-medium">Product</th>
                      <th className="py-3 pr-4 font-medium">Category</th>
                      <th className="py-3 pr-4 font-medium">Stock</th>
                      <th className="py-3 pr-4 font-medium">Price</th>
                      <th className="py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.name} className="border-b border-slate-100 last:border-0">
                        <td className="py-4 pr-4 font-semibold">{product.name}</td>
                        <td className="py-4 pr-4">{product.category}</td>
                        <td className="py-4 pr-4">{product.stock} units</td>
                        <td className="py-4 pr-4">{formatMoney(product.price)}</td>
                        <td className="py-4">
                          <StatusBadge status={product.stock <= 8 ? 'Low Stock' : 'Completed'} />
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-500">
                          No matching products found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activePage === 'Customers' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionTitle
                title="Customers"
                description="Customers are listed automatically from recorded sales."
              />
              <div className="mb-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Unique customers</p>
                  <p className="mt-2 text-2xl font-bold">{customers.length}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Sales transactions</p>
                  <p className="mt-2 text-2xl font-bold">{sales.length}</p>
                </div>
              </div>
              <form
                onSubmit={handleCustomerSubmit}
                className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <h3 className="mb-4 text-lg font-semibold text-slate-800">
                  {editingCustomer ? 'Edit Customer' : 'Register Customer'}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="new-customer-name"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Customer name
                    </label>
                    <input
                      id="new-customer-name"
                      type="text"
                      value={newCustomerName}
                      onChange={(event) => setNewCustomerName(event.target.value)}
                      placeholder="Enter full name"
                      readOnly={Boolean(editingCustomer)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 read-only:bg-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="new-customer-phone"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Phone number
                    </label>
                    <input
                      id="new-customer-phone"
                      type="tel"
                      value={newCustomerPhone}
                      onChange={(event) => setNewCustomerPhone(event.target.value)}
                      placeholder="Enter phone number"
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                      required
                    />
                  </div>
                </div>
                {customerMessage && (
                  <p
                    role="status"
                    className={`mt-3 text-sm ${
                      customerError ? 'text-red-600' : 'text-emerald-700'
                    }`}
                  >
                    {customerMessage}
                  </p>
                )}
                <button
                  type="submit"
                  className="mt-4 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  {editingCustomer ? 'Update Phone Number' : 'Save Customer'}
                </button>
                {editingCustomer && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCustomer('')
                      setNewCustomerName('')
                      setNewCustomerPhone('')
                      setCustomerMessage('')
                      setCustomerError(false)
                    }}
                    className="ml-2 mt-4 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                )}
              </form>

              <div className="mb-5">
                <label
                  htmlFor="customer-search"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Search customers
                </label>
                <input
                  id="customer-search"
                  type="search"
                  value={customerSearch}
                  onChange={(event) => setCustomerSearch(event.target.value)}
                  placeholder="Search customers by name..."
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-3 pr-4 font-medium">Customer</th>
                      <th className="py-3 pr-4 font-medium">Phone number</th>
                      <th className="py-3 pr-4 font-medium">Transactions</th>
                      <th className="py-3 text-right font-medium">Total purchases</th>
                      <th className="py-3 pl-4 font-medium">History</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers
                      .filter((name) =>
                        name.toLowerCase().includes(customerSearch.trim().toLowerCase()),
                      )
                      .map((name) => {
                      const customerSales = sales.filter((sale) => sale.customer === name)
                      const customerTotal = customerSales.reduce(
                        (total, sale) => total + sale.amount,
                        0,
                      )
                      return (
                        <tr key={name} className="border-b border-slate-100 last:border-0">
                          <td className="py-4 pr-4 font-semibold">{name}</td>
                          <td className="py-4 pr-4">
                            {customerRecords.find(
                              (record) => record.name.toLowerCase() === name.toLowerCase(),
                            )?.phone || 'Not provided'}
                          </td>
                          <td className="py-4 pr-4">{customerSales.length}</td>
                          <td className="py-4 text-right font-semibold">{formatMoney(customerTotal)}</td>
                          <td className="py-4 pl-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const record = customerRecords.find(
                                    (item) =>
                                      item.name.toLowerCase() === name.toLowerCase(),
                                  )
                                  setNewCustomerName(name)
                                  setNewCustomerPhone(record?.phone || '')
                                  setEditingCustomer(name)
                                  setCustomerMessage('')
                                  setCustomerError(false)
                                }}
                                className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedCustomerHistory(name)}
                                className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                              >
                                View History
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {customers.filter((name) =>
                      name.toLowerCase().includes(customerSearch.trim().toLowerCase()),
                    ).length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-500">
                          {customers.length === 0
                            ? 'No customers recorded yet. Record a sale to add a customer.'
                            : 'No customers match your search.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {selectedCustomerHistory && (
                <section className="mt-6 rounded-xl border border-slate-200 p-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        Purchase History
                      </h3>
                      <p className="text-sm text-slate-500">
                        {selectedCustomerHistory}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCustomerHistory('')}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Close History
                    </button>
                  </div>

                  <div className="mb-4 rounded-lg bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Total purchases</p>
                    <p className="mt-1 text-xl font-bold text-slate-800">
                      {formatMoney(
                        sales
                          .filter(
                            (sale) =>
                              sale.customer.toLowerCase() ===
                              selectedCustomerHistory.toLowerCase(),
                          )
                          .reduce((total, sale) => total + sale.amount, 0),
                      )}
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                          <th className="py-3 pr-4 font-medium">Date</th>
                          <th className="py-3 pr-4 font-medium">Product</th>
                          <th className="py-3 pr-4 font-medium">Amount</th>
                          <th className="py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sales
                          .filter(
                            (sale) =>
                              sale.customer.toLowerCase() ===
                              selectedCustomerHistory.toLowerCase(),
                          )
                          .sort((a, b) => b.date.localeCompare(a.date))
                          .map((sale) => (
                            <tr
                              key={sale.id}
                              className="border-b border-slate-100 last:border-0"
                            >
                              <td className="py-3 pr-4">{sale.date}</td>
                              <td className="py-3 pr-4">{sale.item}</td>
                              <td className="py-3 pr-4 font-medium">
                                {formatMoney(sale.amount)}
                              </td>
                              <td className="py-3">{sale.status}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </section>
          )}

          {activePage === 'Reports' && (
            <>
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionTitle
                  title="Business Reports"
                  description="A financial summary based on the current recorded data."
                />
                <div className="mb-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={exportSalesReport}
                    className="rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Export Sales CSV
                  </button>
                  <button
                    type="button"
                    onClick={exportExpensesReport}
                    className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Export Expenses CSV
                  </button>
                  <button
                    type="button"
                    onClick={exportInventoryReport}
                    className="rounded-lg bg-slate-700 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Export Inventory CSV
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-5">
                    <p className="text-sm text-slate-500">Total Sales</p>
                    <p className="mt-2 text-xl font-bold">{formatMoney(totalSales)}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-5">
                    <p className="text-sm text-slate-500">Total Expenses</p>
                    <p className="mt-2 text-xl font-bold">{formatMoney(totalExpenses)}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-5">
                    <p className="text-sm text-slate-500">Net Balance</p>
                    <p className={`mt-2 text-xl font-bold ${netProfit < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                      {formatMoney(netProfit)}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionTitle title="Expense Breakdown" description="Total spending by category." />
                <div className="space-y-5">
                  {expenseCategories
                    .map((category) => ({
                      category,
                      amount: expenses
                        .filter((expense) => expense.category === category)
                        .reduce((sum, expense) => sum + expense.amount, 0),
                    }))
                    .filter((item) => item.amount > 0)
                    .sort((a, b) => b.amount - a.amount)
                    .map((item) => (
                      <div key={item.category}>
                        <div className="mb-2 flex justify-between gap-3 text-sm">
                          <span className="font-medium">{item.category}</span>
                          <span className="font-semibold">{formatMoney(item.amount)}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full bg-emerald-500"
                            style={{
                              width: `${totalExpenses > 0 ? item.amount / totalExpenses * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  {expenses.length === 0 && (
                    <p className="text-sm text-slate-500">Record expenses to see the category breakdown.</p>
                  )}
                </div>
              </section>
            </>
          )}

          <footer className="border-t border-slate-200 pt-5 text-center text-sm text-slate-500">
            Kakuma Digital Business Assistant · Demo version using sample data
          </footer>
        </div>
      </main>
    </div>
  )
}

export default App
