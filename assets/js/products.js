// 1. إعداد Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBJkpqCGBRITqc66TQtkdQ_Rj0Jwd5uhZI",
    authDomain: "company-23271.firebaseapp.com",
    databaseURL: "https://company-23271-default-rtdb.firebaseio.com",
    projectId: "company-23271",
    storageBucket: "company-23271.firebasestorage.app",
    messagingSenderId: "48019146673",
    appId: "1:48019146673:web:b4f7bc91bb169c43b29f90"
  };
  
  // تفعيل Firebase
  const app = firebase.initializeApp(firebaseConfig);
  const db = firebase.database(app);
  
  function loadProductsFromDatabase() {
    const loader = document.getElementById('loader');
    const productList = document.getElementById('product-list');
    const categorySelect = document.getElementById('category-select');
  
    loader.style.display = 'block';
  
    // 🗃️ كائن لتخزين كل الأقسام
    const categorySections = {};
    const allGlobalCards = [];
  
    db.ref('products').on('value', (snapshot) => {
      const data = snapshot.val();
      productList.innerHTML = '';
      categorySelect.innerHTML = '<option value="all">كل الأقسام</option>'; // Reset
  
      if (data) {
        Object.keys(data).forEach(category => {
          // 🧱 إنشاء سكشن القسم
          const sectionDiv = document.createElement('div');
          sectionDiv.classList.add('mb-5');
          sectionDiv.setAttribute('data-category', category);
  
          // 🔠 عنوان القسم + زر عرض المزيد
          const categoryHeader = document.createElement('div');
          categoryHeader.classList.add('d-flex', 'justify-content-between', 'align-items-center', 'mb-2');
  
          const categoryBtn = document.createElement('button');
          categoryBtn.classList.add('btn', 'btn-outline-success');
          categoryBtn.textContent = category;
          categoryBtn.onclick = () => {
            window.location.href = `category.html?name=${encodeURIComponent(category)}`;
          };
  
          const showMoreBtn = document.createElement('button');
          showMoreBtn.classList.add('btn', 'btn-sm', 'btn-secondary');
          showMoreBtn.textContent = 'عرض المزيد';
          showMoreBtn.onclick = () => {
            window.location.href = `category.html?name=${encodeURIComponent(category)}`;
          };
  
          categoryHeader.appendChild(categoryBtn);
          categoryHeader.appendChild(showMoreBtn);
          sectionDiv.appendChild(categoryHeader);
  
          // 🔍 محرك بحث داخل القسم
          const searchInput = document.createElement('input');
          searchInput.type = 'text';
          searchInput.placeholder = 'ابحث في هذا القسم...';
          searchInput.classList.add('form-control', 'mb-3');
          sectionDiv.appendChild(searchInput);
  
          // 🎞️ سلايدر المنتجات
          const sliderContainer = document.createElement('div');
          sliderContainer.classList.add('position-relative');
  
          const slider = document.createElement('div');
          slider.classList.add('d-flex', 'overflow-auto', 'px-2');
          slider.style.scrollBehavior = 'smooth';
          slider.style.gap = '1rem';
          slider.style.padding = '1rem 0';
  
          const sectionCards = [];
  
          const products = Array.isArray(data[category]) ? data[category] : Object.values(data[category]);
          products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.style.minWidth = '300px';
            productCard.style.maxWidth = '300px';
            productCard.classList.add('flex-shrink-0');
  
            // 🧾 كارت المنتج
            productCard.innerHTML = `
              <div class="card h-100">
                <img src="${product.image}" class="card-img-top" alt="${product.name}">
                <div class="card-body">
                  <h5 class="card-title">${product.name}</h5>
                  <p class="card-text">السعر: ${product.price} جنيه</p>
                  <div class="mb-2">
                    <label class="form-label">الكمية:</label>
                    <input type="number" min="1" max="20" value="1" class="form-control form-control-sm" id="qty-${product.id}">
                  </div>
                  <button class="btn btn-primary" onclick="addToCart('${product.id}')">اضف الى السلة</button>
                </div>
              </div>
            `;
  
            slider.appendChild(productCard);
            sectionCards.push({ element: productCard, name: product.name });
            allGlobalCards.push({ element: productCard, name: product.name });
          });
  
          // ⬅️➡️ أزرار تقليب السلايدر
          const leftBtn = document.createElement('button');
          leftBtn.classList.add('btn', 'btn-light', 'position-absolute', 'top-50', 'start-0', 'translate-middle-y', 'shadow');
          leftBtn.innerHTML = '&larr;';
          leftBtn.style.zIndex = '2';
          leftBtn.onclick = () => {
            slider.scrollBy({ left: -1000, behavior: 'smooth' });
          };
  
          const rightBtn = document.createElement('button');
          rightBtn.classList.add('btn', 'btn-light', 'position-absolute', 'top-50', 'end-0', 'translate-middle-y', 'shadow');
          rightBtn.innerHTML = '&rarr;';
          rightBtn.style.zIndex = '2';
          rightBtn.onclick = () => {
            slider.scrollBy({ left: 1000, behavior: 'smooth' });
          };
  
          // 🔍 فلترة داخل القسم
          searchInput.addEventListener('input', () => {
            const value = searchInput.value.toLowerCase();
            sectionCards.forEach(card => {
              card.element.style.display = card.name.toLowerCase().includes(value) ? 'block' : 'none';
            });
          });
  
          // 📦 تجميع كل حاجة
          sliderContainer.appendChild(leftBtn);
          sliderContainer.appendChild(slider);
          sliderContainer.appendChild(rightBtn);
          sectionDiv.appendChild(sliderContainer);
          productList.appendChild(sectionDiv);
  
          // 🧭 نحفظ القسم في كائن علشان نتحكم فيه بالفلترة
          categorySections[category] = sectionDiv;
  
          // 📋 نضيف القسم لـ select
          const option = document.createElement('option');
          option.value = category;
          option.textContent = category;
          categorySelect.appendChild(option);
        });
  
        // 📌 عند تغيير الاختيار في select، نعرض القسم المطلوب فقط
        categorySelect.addEventListener('change', () => {
          const selected = categorySelect.value;
          loader.style.display = 'block';
  
          Object.keys(categorySections).forEach(cat => {
            categorySections[cat].style.display = (selected === 'all' || selected === cat) ? 'block' : 'none';
          });
  
          setTimeout(() => {
            loader.style.display = 'none';
          }, 500); // ممكن تخليها أقل أو أكتر حسب سرعة البيانات
        });
      }
  
      loader.style.display = 'none';
    }, error => {
      console.error('Error loading products: ', error);
    });
  }
  // 🚀 تحميل المنتجات عند فتح الصفحة
  window.onload = loadProductsFromDatabase;
  


  

