// Memuat komponen HTML modular dari folder components/ ke dalam container.
export async function mount(selector, names){
  const root = document.querySelector(selector);
  if(!root) throw new Error('Container tidak ditemukan: '+selector);
  const parts = await Promise.all(
    names.map(n =>
      fetch(`components/${n}.html`, {cache:'no-store'})
        .then(r => { if(!r.ok) throw new Error('Gagal memuat '+n); return r.text(); })
    )
  );
  root.insertAdjacentHTML('beforeend', parts.join('\n'));
}
