const firebaseConfig = {
  apiKey: "AIzaSyBJkpqCGBRITqc66TQtkdQ_Rj0Jwd5uhZI",
  authDomain: "company-23271.firebaseapp.com",
  databaseURL: "https://company-23271-default-rtdb.firebaseio.com",
  projectId: "company-23271",
  storageBucket: "company-23271.firebasestorage.app",
  messagingSenderId: "48019146673",
  appId: "1:48019146673:web:b4f7bc91bb169c43b29f90"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const productsRef = db.ref("products");

// الحصول على الآي دي التالي من آخر منتج
async function getNextProductId() {
  const snapshot = await productsRef.once('value');
  const products = snapshot.val();
  let maxId = 200; // نبدأ من 201
  if (products) {
    Object.keys(products).forEach(key => {
      const id = parseInt(key, 10);
      if (id > maxId) maxId = id;
    });
  }
  return maxId + 1;
}

function showMessage(msg, color = "green") {
  const msgDiv = document.getElementById("message");
  msgDiv.style.color = color;
  msgDiv.innerText = msg;
}

async function addProduct() {
  const name = document.getElementById("product-name").value.trim();
  const price = parseFloat(document.getElementById("product-price").value);
  const image = document.getElementById("product-image").value.trim();

  if (!name || isNaN(price) || !image) {
    showMessage("يرجى إدخال جميع البيانات بشكل صحيح.", "red");
    return;
  }

  const newId = await getNextProductId();

  const newProduct = {
    name,
    price,
    image
  };

  db.ref("products/" + newId).set(newProduct, error => {
    if (error) {
      showMessage("حدث خطأ أثناء الحفظ.", "red");
    } else {
      showMessage("تم إضافة المنتج بنجاح ✅");
      document.getElementById("product-name").value = "";
      document.getElementById("product-price").value = "";
      document.getElementById("product-image").value = "";
    }
  });
}

function renderProducts(products) {
  const tbody = document.getElementById("products-table-body");
  tbody.innerHTML = "";

  Object.entries(products).forEach(([id, product]) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${id}</td>
      <td contenteditable="true" onblur="updateField('${id}', 'name', this.innerText)">${product.name}</td>
      <td contenteditable="true" onblur="updateField('${id}', 'price', this.innerText)">${product.price}</td>
      <td><img src="${product.image}" width="60"></td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deleteProduct('${id}')">حذف</button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

function updateField(id, field, value) {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    alert("القيمة لا يمكن أن تكون فارغة.");
    fetchAndRenderProducts(); // نرجع القيمة الأصلية
    return;
  }

  if (field === 'price') {
    const priceValue = parseFloat(trimmedValue);
    if (isNaN(priceValue)) {
      alert("السعر غير صالح.");
      fetchAndRenderProducts();
      return;
    }
    value = priceValue;
  }

  db.ref("products/" + id + "/" + field).set(value)
    .then(() => showMessage(`تم تحديث ${field === 'name' ? "الاسم" : "السعر"} بنجاح ✅`))
    .catch(() => showMessage("فشل التحديث ❌", "red"));
}

function deleteProduct(id) {
  // عرض نموذج كلمة السر
  window.productIdToDelete = id; // تخزين المعرف
  document.getElementById("password-container").style.display = "block";
}

function cancelDelete() {
  document.getElementById("password-container").style.display = "none";
  document.getElementById("password-message").style.display = "none";
}

async function verifyPassword() {
  const enteredPassword = document.getElementById("password").value.trim();
  const messageDiv = document.getElementById("password-message");

  if (enteredPassword === "0000") {
    // إذا كانت كلمة السر صحيحة، حذف المنتج
    productsRef.child(window.productIdToDelete).remove()
      .then(() => {
        showMessage("تم حذف المنتج بنجاح ✅", "green");
        fetchAndRenderProducts();
      })
      .catch(() => showMessage("فشل الحذف ❌", "red"));
    cancelDelete();
  } else {
    messageDiv.innerText = "كلمة السر غير صحيحة.";
    messageDiv.style.display = "block";
  }
}


// دالة لتحميل وعرض المنتجات من قاعدة البيانات بشكل لحظي، مع تحديث عدد المنتجات المعروض في الصفحة
function fetchAndRenderProducts() {
document.getElementById("loader").style.display = "block"; // إظهار اللودر أثناء تحميل البيانات

// الاستماع للتغييرات في قاعدة البيانات
productsRef.on("value", (snapshot) => {
const products = snapshot.val() || {};  // إذا كانت قاعدة البيانات فارغة، يتم تعيين مصفوفة فارغة
renderProducts(products); // تحديث الجدول بالمنتجات الجديدة أو المعدلة
document.getElementById("loader").style.display = "none"; // إخفاء اللودر بعد التحميل

// تحديث عدد المنتجات
const productCount = Object.keys(products).length;
document.getElementById("product-count-value").innerText = productCount;
});
}

// استماع للتغييرات في المنتجات
// عند تعديل أي منتج، نقوم بتحديث الجدول بشكل لحظي
productsRef.on("child_changed", (snapshot) => {
const updatedProduct = snapshot.val();  // المنتج المعدل
const productId = snapshot.key; // المعرف الخاص بالمنتج المعدل

// العثور على الصف الذي يحتوي على المنتج المعدل باستخدام المعرف
const row = document.querySelector(`tr[data-id='${productId}']`);
if (row) {
// تحديث البيانات في الجدول بدون إعادة تحميل الصفحة
row.querySelector("td:nth-child(2)").innerText = updatedProduct.name; // تحديث اسم المنتج
row.querySelector("td:nth-child(3)").innerText = updatedProduct.price; // تحديث سعر المنتج
row.querySelector("td:nth-child(4) img").src = updatedProduct.image; // تحديث صورة المنتج
}

// تحديث عدد المنتجات
updateProductCount();
});

// تحديث عدد المنتجات
function updateProductCount() {
productsRef.once("value", (snapshot) => {
const products = snapshot.val() || {};  // في حالة عدم وجود منتجات
const productCount = Object.keys(products).length;  // حساب عدد المنتجات
document.getElementById("product-count-value").innerText = productCount; // تحديث العرض
});
}

// استماع لحذف أي منتج
// عند حذف منتج، نقوم بإزالته من الجدول مباشرة
productsRef.on("child_removed", (snapshot) => {
const productId = snapshot.key;  // المعرف الخاص بالمنتج المحذوف

// العثور على الصف الذي يحتوي على المنتج المحذوف باستخدام المعرف
const row = document.querySelector(`tr[data-id='${productId}']`);
if (row) {
row.remove();  // إزالة الصف من الجدول
}

// تحديث عدد المنتجات
updateProductCount();
});

// بحث مباشر
document.getElementById("search-input").addEventListener("input", function () {
const searchTerm = this.value.toLowerCase();
const rows = document.querySelectorAll("#products-table-body tr");

rows.forEach(row => {
const id = row.children[0].innerText.toLowerCase();
const name = row.children[1].innerText.toLowerCase();

if (id.includes(searchTerm) || name.includes(searchTerm)) {
  row.style.display = "";
} else {
  row.style.display = "none";
}
});
});
fetchAndRenderProducts();