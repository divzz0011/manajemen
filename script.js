let daftarBarang = JSON.parse(localStorage.getItem('inventoryData')) || [];
let selectedIndexes = [];

document.addEventListener('DOMContentLoaded', () => {
    const inputNama = document.getElementById('namaBarang');
    const inputJumlah = document.getElementById('jumlahBarang');
    const editNama = document.getElementById('editNama');
    const editJumlah = document.getElementById('editJumlah');

    // Navigasi Enter
    inputNama.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); inputJumlah.focus(); } });
    inputJumlah.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); tambahBarang(); } });
    editNama.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); editJumlah.focus(); } });
    editJumlah.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); updateBarang(); } });

    renderTable();
});

function renderTable() {
    const tableBody = document.getElementById('tabelBody');
    tableBody.innerHTML = daftarBarang.length === 0 
        ? '<tr><td colspan="4" class="p-8 text-center text-gray-500 italic">Belum ada data barang.</td></tr>' 
        : '';

    daftarBarang.forEach((item, index) => {
        const isChecked = selectedIndexes.includes(index) ? 'checked' : '';
        const row = `
            <tr class="border-b hover:bg-gray-50 transition">
                <td class="p-4 text-center">
                    <input type="checkbox" class="row-checkbox w-4 h-4 rounded" data-index="${index}" ${isChecked} onclick="updateSelection()">
                </td>
                <td class="p-4 text-gray-800 font-medium">${item.nama}</td>
                <td class="p-4 text-gray-800">${item.jumlah}</td>
                <td class="p-4 text-center space-x-4">
                    <button onclick="bukaModalEdit(${index})" class="text-blue-600 hover:text-blue-800">Edit</button>
                    <button onclick="hapusBarang(${index})" class="text-red-500 hover:text-red-700">Hapus</button>
                </td>
            </tr>`;
        tableBody.innerHTML += row;
    });
    updateSelection();
}

function updateSelection() {
    const checkboxes = document.querySelectorAll('.row-checkbox');
    selectedIndexes = [];
    checkboxes.forEach(cb => {
        if (cb.checked) selectedIndexes.push(parseInt(cb.dataset.index));
    });

    const bulkActions = document.getElementById('bulkActions');
    const selectAllCb = document.getElementById('selectAll');
    const selectedText = document.getElementById('selectedCount');

    if (selectedIndexes.length > 0) {
        bulkActions.classList.remove('hidden');
        selectedText.innerText = `${selectedIndexes.length} Item Terpilih`;
    } else {
        bulkActions.classList.add('hidden');
    }

    selectAllCb.checked = checkboxes.length > 0 && selectedIndexes.length === checkboxes.length;
}

function toggleSelectAll() {
    const isChecked = document.getElementById('selectAll').checked;
    document.querySelectorAll('.row-checkbox').forEach(cb => cb.checked = isChecked);
    updateSelection();
}

function tambahBarang() {
    const elNama = document.getElementById('namaBarang');
    const elJumlah = document.getElementById('jumlahBarang');
    if (elNama.value && elJumlah.value) {
        daftarBarang.push({ nama: elNama.value, jumlah: elJumlah.value });
        simpanData(); renderTable();
        elNama.value = ''; elJumlah.value = ''; elNama.focus();
    }
}

function hapusTerpilih() {
    if (confirm(`Hapus ${selectedIndexes.length} item terpilih?`)) {
        // Hapus dari indeks terbesar agar tidak merusak urutan array
        selectedIndexes.sort((a, b) => b - a).forEach(index => {
            daftarBarang.splice(index, 1);
        });
        selectedIndexes = [];
        simpanData(); renderTable();
    }
}

function eksporTerpilih() {
    const dataTerpilih = selectedIndexes.map(index => daftarBarang[index]);
    eksporExcel(dataTerpilih);
}

function eksporExcel(dataToExport) {
    if (dataToExport.length === 0) return alert("Data kosong!");
    let namaFile = prompt("Masukkan nama file:", "Data_Inventaris");
    if (namaFile === null) return;
    const finalName = namaFile.trim() === "" ? "Data_Inventaris" : namaFile.trim();
    
    const ws = XLSX.utils.json_to_sheet(dataToExport.map(item => ({ "Nama Barang": item.nama, "Jumlah": item.jumlah })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventaris");
    XLSX.writeFile(wb, `${finalName}.xlsx`);
}

// ... (Fungsi Edit, SimpanData, ToggleDevInfo tetap sama seperti sebelumnya) ...
function bukaModalEdit(index) {
    const item = daftarBarang[index];
    document.getElementById('editIndex').value = index;
    document.getElementById('editNama').value = item.nama;
    document.getElementById('editJumlah').value = item.jumlah;
    document.getElementById('modalEdit').classList.remove('hidden');
    document.getElementById('editNama').focus();
}
function tutupModal() { document.getElementById('modalEdit').classList.add('hidden'); }
function updateBarang() {
    const index = document.getElementById('editIndex').value;
    const n = document.getElementById('editNama').value;
    const j = document.getElementById('editJumlah').value;
    if (n && j) {
        daftarBarang[index] = { nama: n, jumlah: j };
        simpanData(); renderTable(); tutupModal();
    }
}
function hapusBarang(index) {
    if (confirm("Hapus barang ini?")) {
        daftarBarang.splice(index, 1);
        simpanData(); renderTable();
    }
}
function simpanData() { localStorage.setItem('inventoryData', JSON.stringify(daftarBarang)); }
function toggleDevInfo() {
    const devInfo = document.getElementById('devInfo');
    devInfo.classList.toggle('hidden');
    if (!devInfo.classList.contains('hidden')) devInfo.scrollIntoView({ behavior: 'smooth' });
}