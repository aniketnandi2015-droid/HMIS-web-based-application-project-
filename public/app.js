const inventory = [
  { name: 'Paracetamol 500 mg', batch: 'PCM-2408', onHand: 18, reorderAt: 30, expiry: '2026-11-12' },
  { name: 'Azithromycin 250 mg', batch: 'AZI-2403', onHand: 42, reorderAt: 25, expiry: '2026-01-18' },
  { name: 'ORS Sachets', batch: 'ORS-2410', onHand: 11, reorderAt: 20, expiry: '2027-03-30' },
  { name: 'Cetirizine 10 mg', batch: 'CTZ-2407', onHand: 68, reorderAt: 35, expiry: '2027-05-08' }
];

export function inventoryStatus(item, today = new Date('2026-09-28')) {
  const daysToExpiry = Math.ceil((new Date(item.expiry) - today) / 86400000);
  if (daysToExpiry <= 90) return 'Expiry risk';
  if (item.onHand <= item.reorderAt) return 'Reorder';
  return 'Healthy';
}

function render() {
  const rows = inventory.map((item) => {
    const status = inventoryStatus(item);
    return `<tr><td>${item.name}</td><td>${item.batch}</td><td>${item.onHand}</td><td>${item.reorderAt}</td><td>${item.expiry}</td><td><span class="status ${status.toLowerCase().replace(' ', '-')}">${status}</span></td></tr>`;
  });
  document.querySelector('#inventory-rows').innerHTML = rows.join('');
  document.querySelector('#low-stock-count').textContent = inventory.filter((item) => item.onHand <= item.reorderAt).length;
  document.querySelector('#expiry-count').textContent = inventory.filter((item) => inventoryStatus(item) === 'Expiry risk').length;
}

if (typeof document !== 'undefined') {
  document.querySelector('#restock-button').addEventListener('click', () => {
    const list = inventory.filter((item) => inventoryStatus(item) === 'Reorder').map((item) => item.name).join(', ');
    document.querySelector('#action-message').textContent = list ? `Replenishment list ready: ${list}.` : 'All products are above their reorder levels.';
  });
  render();
}
