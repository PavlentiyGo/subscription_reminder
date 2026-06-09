import React, { useEffect, useState } from 'react'

const BASE = 'https://sandbag-maternity-clamp.ngrok-free.dev'

type Subscription = {
  subscription_id: number
  price: number
  currency: string
  name: string
  type: string
  billing_at: string
}

export default function Subscriptions() {
  const [list, setList] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // form state
  const [price, setPrice] = useState<number | ''>('')
  const [currency, setCurrency] = useState('RUB')
  const [name, setName] = useState('')
  const [type, setType] = useState('STREAMING')
  const [billingAt, setBillingAt] = useState('')

  function showToast(message: string, t: 'success' | 'error' = 'success') {
    setToast({ type: t, message })
    setTimeout(() => setToast(null), 3500)
  }

  function formatBillingDate(value?: string) {
    if (!value) return '—'
    // expect YYYY-MM-DD
    const parts = value.split('-')
    if (parts.length < 3) return value
    const day = Number(parts[2])
    const month = Number(parts[1])
    const months = [
      'января',
      'февраля',
      'марта',
      'апреля',
      'мая',
      'июня',
      'июля',
      'августа',
      'сентября',
      'октября',
      'ноября',
      'декабря'
    ]
    return `${day} ${months[month - 1] || ''}`
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  function getInitDataHeader() {
    try {
      const initData = (window as any).Telegram?.WebApp?.initData || ''
      return initData
    } catch (e) {
      return ''
    }
  }

  async function fetchSubscriptions() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${BASE}/subscriptions`, {
        headers: {
          Authorization: getInitDataHeader(),
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      })
      // If server returns 204 No Content, treat as empty list (not an error)
      if (res.status === 204) {
        setList([])
        return
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
      const parsed = text ? JSON.parse(text) : {}
      if (Array.isArray(parsed)) {
        setList(parsed)
      } else {
        setList(parsed.subscriptions || [])
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Fetch error')
      showToast('Не удалось загрузить подписки', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const payload = {
      price: Number(price),
      currency,
      name,
      type,
      // send date in YYYY-MM-DD format (no time)
      billing_at: billingAt
    }
    try {
      const res = await fetch(`${BASE}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: getInitDataHeader()
        },
        body: JSON.stringify(payload)
      })
      if (res.status === 400) {
        showToast('Неверные данные. Проверьте поля формы. Цена не может быть отрицательной, а дата меньше сегодняшней', 'error')
        return
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const created = await res.json()
      showToast('Подписка создана', 'success')
      fetchSubscriptions()

      setPrice('')
      setName('')
      setBillingAt('')
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Create error')
      showToast('Ошибка при создании подписки', 'error')
    }
  }

  return (
    <div className="page">
      <section className="panel">
        <h2>Subscriptions</h2>
        <div>
          <button onClick={fetchSubscriptions} disabled={loading}>
            Refresh
          </button>
        </div>
        {loading && <div className="muted">Loading...</div>}
        {list.length === 0 && !loading && !error ? (
          <div className="empty">No subscriptions yet. Create one below.</div>
        ) : (
          <div className="list">
            {list.map((s) => (
              <div className="card" key={s.subscription_id}>
                <div className="card-row">
                  <div className="card-title">{s.name}</div>
                  <div className="card-price">{s.price} {s.currency}</div>
                </div>
                <div className="card-row muted">{s.type} • {formatBillingDate(s.billing_at)}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <h2>Create Subscription</h2>
        <form onSubmit={handleCreate} className="form">
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} required minLength={3} maxLength={100} />
          </label>
          <label>
            Price
            <input type="number" value={price as any} onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} required />
          </label>
          <label>
            Currency
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option>RUB</option>
              <option>EUR</option>
              <option>USD</option>
            </select>
          </label>
          <label>
            Type
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option>STREAMING</option>
              <option>SOFTWARE</option>
              <option>UTILITIES</option>
              <option>FINANCE</option>
              <option>HEALTH</option>
              <option>EDUCATION</option>
              <option>OTHER</option>
            </select>
          </label>
          <label>
            Billing date
            <input type="date" value={billingAt} onChange={(e) => setBillingAt(e.target.value)} required />
          </label>
          <div>
            <button type="submit">Create</button>
          </div>
        </form>
      </section>
      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}
