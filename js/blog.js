let dataFilter;
let dataProduct;
let optionSelect = [];

async function fetchData(file, dataType) {
    try {
        const response = await fetch(file);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (dataType == 'filter') dataFilter = data;
        if (dataType == 'products') dataProduct = data;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}
let listFilterHtml = document.getElementById('list-filter');
let listProductHtml = document.getElementById('list-product');
//fetch data filter 
(async () => await fetchData('../filter.json', 'filter').then(() => {
    // Sau khi fetchData hoàn tất, render filter data
    dataFilter.filters.map((item) => {
        let listOptionHtml = '';
        item.option.map(option => {
            let optionItem = `<li class="js-filterable">
                <label class="menu-item">
                <input class="checkbox js-option" type="checkbox" value="${option}" />
                <div class="choice-input"></div><span>${option}</span>
                </label>
            </li>`
            listOptionHtml += optionItem;
        });

        let blockFilter = `<div class="wrap-filter col-6 col-lg-3 ${item.name}">
        <h4>${item.name}</h4>
        <div class="select-menu js-select-menu">
          <input class="menu-state js-menu-state" id="${item.name}" type="checkbox" />
          <label class="select-label js-select-label" data-default-label="Any" data-label="Any"
            for="${item.name}">
            <div class="arrow"></div>
          </label>
          <ul class="menu js-select-options">
          ${listOptionHtml}
          </ul>
        </div>
      </div>`;

        // insert filter lên đầu
        listFilterHtml.insertAdjacentHTML('afterbegin', blockFilter);
        document.querySelectorAll('.js-option').forEach(function (option) {
            option.addEventListener('change', function () {
                var optionMenu = option.closest('.js-select-options');
                var checkedList = optionMenu.querySelectorAll('.js-option:checked ~ span');
                var label = optionMenu.previousElementSibling;
                // đóng filter
                label.previousElementSibling.checked = false;
                // check filter nếu không chọn sẽ return về tất cả sản phẩm
                if (!checkedList.length) {
                    label.dataset.label = 'Any';
                    renderHTML(dataProduct.products);
                    return;
                }

                // filter
                let text = '';
                checkedList.forEach(function (checked, index) {
                    text += checked.textContent;
                    if (index + 1 !== checkedList.length) {
                        text += ',';
                    }
                });

                label.dataset.label = text;
                // render lại list khi change select
                optionSelect = label.dataset.label.split(',');
                let listDataRender = dataProduct.products.filter(item => {
                    // check trong list optionSelect(list filter) có item nằm trong list item.brand không?
                    for (let data of item.filterTag) {
                        if (optionSelect.includes(data)) {
                            // nếu có thì nó trả ra true => thì nó sẽ trả ra item trong list listDataRender
                            return true
                        }
                    }
                    // nếu có thì nó trả ra false => thì nó sẽ không trả ra item trong list listDataRender 
                    return false
                });
                renderHTML(listDataRender);
            });
        });

        // clear filter
        document.getElementById('clear-all').addEventListener('click', function (event) {
            event.preventDefault();
            document.querySelectorAll('.js-option').forEach(function (option) {
                //reset checked
                option.checked = false;

                // thay đổi label của filter thành 'ALL'
                let optionMenu = option.closest('.js-select-options');
                let label = optionMenu.previousElementSibling;
                label.dataset.label = 'Any';


                // đóng tất cả các filter nếu đang mở
                let flagFilter = label.previousElementSibling;
                flagFilter.checked = false;

                // render tại tất cả các sản phẩm
                renderHTML(dataProduct.products);
            });
        });
    })

}))();

//fetch data product 
(async () => await fetchData('../data.json', 'products').then(() => {
    // Sau khi fetchData hoàn tất, render data
    renderHTML(dataProduct.products);

}))();


function renderHTML(list) {
    //reset list data trước khi render mới
    listProductHtml.innerHTML = '';
    // map data để hiển thị trên HTML
    if (list.length > 0) {
        list.map((item, index) => {
            let blockCard = `<a class="card-custom col-6 col-lg-3" href="#">
            <img
              src="${item.image}"
              alt="${item.name}" loading="lazy">
            <h3>${item.name}</h3>
            <div class="list-tag">
              <span class="GF">GF</span>
              <span class="VG">VG</span>
              <span class="V">V</span>
              <span class="DF">DF</span>
              <span class="NS">NS</span>
            </div>
          </a>`
            listProductHtml.innerHTML += blockCard;
        });
    } else listProductHtml.innerHTML = `<div class="empty-data">NO DATA</div>`
}

document.addEventListener('DOMContentLoaded', function() {
    const subscribeButton = document.getElementById('subscribeButton');
  
    subscribeButton.addEventListener('click', function() {
      // Yêu cầu cấp quyền thông báo
      Notification.requestPermission().then(function(permission) {
        if (permission === 'granted') {
          // Hiển thị thông báo khi quyền được cấp
          new Notification('Thông báo đã được kích hoạt!');
        } else {
          alert('Bạn đã từ chối cấp quyền thông báo.');
        }
      });
    });
  });

  function handleInput() {
    // Ẩn biểu tượng nếu có nội dung trong trường nhập liệu
    if (document.getElementById('mainSearchInput').value !== '') {
      document.getElementById('searchIcon').style.display = 'none';
    } else {
      document.getElementById('searchIcon').style.display = 'block';
    }
  }


  function searchProduct(event) {
    // Tiến hành function bằng nút enter
    event.preventDefault();
    
    let inputKey = document.getElementById('searchInput').value.toLowerCase();
    let dataFilter = dataProduct.products.filter(item => item.name.toLowerCase().includes(inputKey.trim()))
    renderHTML(dataFilter);
    // scroll đến list data
    document.getElementById("list-product").scrollIntoView();
  }

  function searchMainProduct(event) {
    // Tiến hành function bằng nút enter
    event.preventDefault();
    
    let inputKey = document.getElementById('mainSearchInput').value.toLowerCase();
    let dataFilter = dataProduct.products.filter(item => item.name.toLowerCase().includes(inputKey.trim()))
    renderHTML(dataFilter);
    // scroll đến list data
    document.getElementById("list-product").scrollIntoView();
  }
  document.getElementById('mainSearchInput').addEventListener('input', function() {
    if (this.value === '') {
      location.reload(); // Tải lại trang khi nội dung trống
    }
  });
