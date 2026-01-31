let products = [];
let filteredProducts = [];
let currentPage = 1;
let itemsPerPage = 10;
let sortColumn = null;
let sortOrder = 'asc';

async function getAllProducts() {
    try {
        const response = await fetch('https://api.escuelajs.co/api/v1/products');
        products = await response.json();
        filteredProducts = [...products];
        renderTable();
        updatePagination();
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

function renderTable() {
    const tbody = document.getElementById('productBody');
    tbody.innerHTML = '';

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageProducts = filteredProducts.slice(start, end);

    pageProducts.forEach(product => {
        const row = document.createElement('tr');

        // Create images HTML
        let imagesHtml = '<div class="img-container">';
        if (product.images && product.images.length > 0) {
            product.images.forEach(imgUrl => {
                // Clean up URL if needed (sometimes the API returns broken URLs with [""])
                let cleanUrl = imgUrl.replace(/[\[\]"]/g, '');
                if (cleanUrl.startsWith('http')) {
                    imagesHtml += `<img src="${cleanUrl}" alt="${product.title}" onerror="this.style.display='none'">`;
                }
            });
        }
        imagesHtml += '</div>';

        row.innerHTML = `
            <td>${product.id}</td>
            <td>${imagesHtml}</td>
            <td>${product.title}</td>
            <td>$${product.price}</td>
            <td class="description-cell">
                Hover to see
                <div class="description-tooltip">${product.description}</div>
            </td>
            <td>${product.category.name}</td>
        `;
        tbody.appendChild(row);
    });
}

function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    filteredProducts = products.filter(product =>
        product.title.toLowerCase().includes(searchTerm)
    );
    currentPage = 1;
    renderTable();
    updatePagination();
}

function sortBy(column) {
    if (sortColumn === column) {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortOrder = 'asc';
    }

    filteredProducts.sort((a, b) => {
        let aVal = a[column];
        let bVal = b[column];

        if (column === 'price') {
            aVal = parseFloat(aVal);
            bVal = parseFloat(bVal);
        } else {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }

        if (sortOrder === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });

    currentPage = 1;
    renderTable();
    updatePagination();
}

function changePage(direction) {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    currentPage += direction;
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    renderTable();
    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages;
}

document.getElementById('searchInput').addEventListener('input', filterProducts);
document.getElementById('itemsPerPage').addEventListener('change', function () {
    itemsPerPage = parseInt(this.value);
    currentPage = 1;
    renderTable();
    updatePagination();
});

// Load products on page load
getAllProducts();