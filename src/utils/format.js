export const money = (n) => '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const todayStr = () => new Date().toISOString().slice(0, 10)
export const isToday = (ts) => ts.slice(0, 10) === todayStr()
